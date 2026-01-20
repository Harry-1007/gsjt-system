const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database/db');

// 计算分数
function calculateScores(answers, scenarios) {
  // 检查是否使用新版本的评分系统
  const firstScenario = scenarios[0];
  const firstOption = firstScenario?.options?.[0];
  const isV2 = firstOption?.scores?.integrity_and_honesty !== undefined;

  let scores;

  if (isV2) {
    // 新版本：4个评分维度
    scores = {
      integrity_and_honesty: 0,
      problem_solving_under_stress: 0,
      effective_communication: 0,
      discipline: 0,
      // 每个 Category 的总分（只算一个总分，不算评级）
      category_totals: {
        A: 0,
        B: 0,
        C: 0
      }
    };

    answers.forEach(answer => {
      const scenario = scenarios.find(s => s.scenario_id === answer.scenario_id);
      if (scenario) {
        const option = scenario.options.find(o => o.option_id === answer.option_id);
        if (option && option.scores) {
          scores.integrity_and_honesty += option.scores.integrity_and_honesty || 0;
          scores.problem_solving_under_stress += option.scores.problem_solving_under_stress || 0;
          scores.effective_communication += option.scores.effective_communication || 0;
          scores.discipline += option.scores.discipline || 0;

          // 计算每个 Category 的总分
          // Category 优先从 scenario_id 中解析：SCENARIO_A001 / SCENARIO_B005 / SCENARIO_C010
          let categoryKey = 'Unknown';
          const idMatch = (scenario.scenario_id || '').match(/^SCENARIO_([A-Z])/);
          if (idMatch) {
            categoryKey = idMatch[1]; // A / B / C
          }

          if (!scores.category_totals[categoryKey]) {
            // 对于非 A/B/C 的情况，初始化一次，避免报错
            scores.category_totals[categoryKey] = 0;
          }

          const optionTotal =
            (option.scores.integrity_and_honesty || 0) +
            (option.scores.problem_solving_under_stress || 0) +
            (option.scores.effective_communication || 0) +
            (option.scores.discipline || 0);

          scores.category_totals[categoryKey] += optionTotal;
        }
      }
    });

    // 计算总分
    scores.total = scores.integrity_and_honesty + scores.problem_solving_under_stress + 
                   scores.effective_communication + scores.discipline;
  } else {
    // 旧版本：6个评分维度（兼容）
    scores = {
      integrity: 0,
      teamwork: 0,
      service_orientation: 0,
      discipline: 0,
      problem_solving: 0,
      stress_tolerance: 0
    };
    
    answers.forEach(answer => {
      const scenario = scenarios.find(s => s.scenario_id === answer.scenario_id);
      if (scenario) {
        const option = scenario.options.find(o => o.option_id === answer.option_id);
        if (option && option.scores) {
          scores.integrity += option.scores.integrity || 0;
          scores.teamwork += option.scores.teamwork || 0;
          scores.service_orientation += option.scores.service_orientation || 0;
          scores.discipline += option.scores.discipline || 0;
          scores.problem_solving += option.scores.problem_solving || 0;
          scores.stress_tolerance += option.scores.stress_tolerance || 0;
        }
      }
    });
    
    // 计算总分
    scores.total = scores.integrity + scores.teamwork + scores.service_orientation + 
                   scores.discipline + scores.problem_solving + scores.stress_tolerance;
  }
  
  return scores;
}

// 确定评级
function determineRating(totalScore, isV2 = false) {
  if (isV2) {
    // 新版本评分阈值（基于30个场景，每个场景最高12分，总分360分）
    if (totalScore >= 270) return 'Highly Recommended';
    if (totalScore >= 180) return 'Recommended';
    if (totalScore >= 120) return 'Borderline';
    return 'Not Recommended';
  } else {
    // 旧版本评分阈值（基于8个场景，每个场景最高18分，总分144分）
    if (totalScore >= 108) return 'Highly Recommended';
    if (totalScore >= 72) return 'Recommended';
    if (totalScore >= 48) return 'Borderline';
    return 'Not Recommended';
  }
}

// 提交答案并计算分数
router.post('/submit', async (req, res) => {
  try {
    const { candidate_id, answers } = req.body;
    
    if (!candidate_id || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: '缺少必要参数或答案为空' });
    }
    
    // 获取所有场景（用于计算分数）
    const scenarios = await all('SELECT * FROM scenarios');
    for (let scenario of scenarios) {
      const options = await all(
        'SELECT * FROM scenario_options WHERE scenario_id = $1',
        [scenario.scenario_id]
      );
      
      scenario.options = options.map(opt => {
        // 检查是否有新版本的评分字段
        const hasNewScores = opt.integrity_and_honesty_score !== null && opt.integrity_and_honesty_score !== undefined;
        
        if (hasNewScores) {
          // 新版本：4个评分维度
          return {
            option_id: opt.option_id,
            scores: {
              integrity_and_honesty: opt.integrity_and_honesty_score || 0,
              problem_solving_under_stress: opt.problem_solving_under_stress_score || 0,
              effective_communication: opt.effective_communication_score || 0,
              discipline: opt.discipline_score || 0
            }
          };
        } else {
          // 旧版本：6个评分维度（兼容）
          return {
            option_id: opt.option_id,
            scores: {
              integrity: opt.integrity_score || 0,
              teamwork: opt.teamwork_score || 0,
              service_orientation: opt.service_orientation_score || 0,
              discipline: opt.discipline_score || 0,
              problem_solving: opt.problem_solving_score || 0,
              stress_tolerance: opt.stress_tolerance_score || 0
            }
          };
        }
      });
    }
    
    // 计算分数
    const totalScores = calculateScores(answers, scenarios);
    const isV2 = totalScores.integrity_and_honesty !== undefined;
    const rating = determineRating(totalScores.total, isV2);
    
    // 检查记录是否存在，保留 started_at
    const existing = await get(
      'SELECT started_at, test_id FROM candidate_results WHERE candidate_id = $1',
      [candidate_id]
    );
    
    let test_id;
    
    if (existing) {
      // 更新现有记录，保留 started_at 和 test_id
      test_id = existing.test_id;
      await run(
        `UPDATE candidate_results 
         SET completed_at = NOW(), 
             total_scores = $1, 
             rating = $2, 
             answers = $3
         WHERE candidate_id = $4`,
        [
          JSON.stringify(totalScores),
          rating,
          JSON.stringify(answers),
          candidate_id
        ]
      );
    } else {
      // 插入新记录
      test_id = `GSJT-${Date.now()}`;
      await run(
        `INSERT INTO candidate_results 
         (candidate_id, test_id, started_at, completed_at, total_scores, rating, answers)
         VALUES ($1, $2, NOW(), NOW(), $3, $4, $5)`,
        [
          candidate_id,
          test_id,
          JSON.stringify(totalScores),
          rating,
          JSON.stringify(answers)
        ]
      );
    }
    
    res.json({
      success: true,
      test_id,
      total_scores: totalScores,
      rating
    });
  } catch (error) {
    console.error('提交结果错误:', error);
    console.error('错误堆栈:', error.stack);
    console.error('请求数据:', { candidate_id, answers_count: answers?.length });
    res.status(500).json({ 
      error: error.message || '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取候选人结果
router.get('/:candidate_id', async (req, res) => {
  try {
    const result = await get(
      'SELECT * FROM candidate_results WHERE candidate_id = $1',
      [req.params.candidate_id]
    );
    
    if (!result) {
      return res.status(404).json({ error: '结果不存在' });
    }
    
    // PostgreSQL JSONB 字段可能已经是对象，也可能还是字符串
    let total_scores = result.total_scores;
    let answers = result.answers;
    
    // 如果是字符串，需要解析；如果已经是对象，直接使用
    if (typeof total_scores === 'string') {
      try {
        total_scores = JSON.parse(total_scores);
      } catch (e) {
        console.warn('解析 total_scores 失败:', e);
        total_scores = {};
      }
    }
    
    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers);
      } catch (e) {
        console.warn('解析 answers 失败:', e);
        answers = [];
      }
    }
    
    res.json({
      ...result,
      total_scores: total_scores || {},
      answers: answers || []
    });
  } catch (error) {
    console.error('获取候选人结果错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取所有结果（管理员）
router.get('/', async (req, res) => {
  try {
    const results = await all('SELECT * FROM candidate_results ORDER BY completed_at DESC NULLS LAST, started_at DESC');
    
    const processedResults = results.map(r => {
      // PostgreSQL JSONB 字段可能已经是对象，也可能还是字符串
      let total_scores = r.total_scores;
      let answers = r.answers;
      
      // 如果是字符串，需要解析；如果已经是对象，直接使用
      if (typeof total_scores === 'string') {
        try {
          total_scores = JSON.parse(total_scores);
        } catch (e) {
          console.warn('解析 total_scores 失败:', e, '原始值:', total_scores);
          total_scores = {};
        }
      }
      
      if (typeof answers === 'string') {
        try {
          answers = JSON.parse(answers);
        } catch (e) {
          console.warn('解析 answers 失败:', e, '原始值:', answers);
          answers = [];
        }
      }
      
      return {
        ...r,
        total_scores: total_scores || {},
        answers: answers || []
      };
    });
    
    res.json(processedResults);
  } catch (error) {
    console.error('获取所有结果错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// 删除结果（管理员）
router.delete('/:candidate_id', async (req, res) => {
  try {
    const { candidate_id } = req.params;
    
    if (!candidate_id) {
      return res.status(400).json({ error: '缺少候选人ID' });
    }
    
    // 检查记录是否存在
    const existing = await get(
      'SELECT candidate_id FROM candidate_results WHERE candidate_id = $1',
      [candidate_id]
    );
    
    if (!existing) {
      return res.status(404).json({ error: '结果不存在' });
    }
    
    // 删除记录
    await run('DELETE FROM candidate_results WHERE candidate_id = $1', [candidate_id]);
    
    res.json({ 
      success: true, 
      message: '删除成功' 
    });
  } catch (error) {
    console.error('删除结果错误:', error);
    res.status(500).json({ error: error.message || '服务器内部错误' });
  }
});

module.exports = router;

