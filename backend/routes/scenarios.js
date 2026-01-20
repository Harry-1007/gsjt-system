const express = require('express');
const router = express.Router();
const { all, get } = require('../database/db');

// 获取所有场景
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/scenarios - 来自: ${req.ip || req.connection.remoteAddress}`);
    
    const scenarios = await all('SELECT * FROM scenarios ORDER BY scenario_id');
    console.log(`找到 ${scenarios.length} 个场景`);
    
    if (scenarios.length === 0) {
      console.warn('警告：数据库中没有场景数据！');
      return res.json([]);
    }
    
    // 为每个场景获取选项
    for (let scenario of scenarios) {
      const options = await all(
        'SELECT * FROM scenario_options WHERE scenario_id = $1 ORDER BY option_id',
        [scenario.scenario_id]
      );
      
      scenario.options = options.map(opt => {
        // 检查是否有新版本的评分字段
        const hasNewScores = opt.integrity_and_honesty_score !== null && opt.integrity_and_honesty_score !== undefined;
        
        if (hasNewScores) {
          // 新版本：4个评分维度
          return {
            option_id: opt.option_id,
            text: opt.option_text,
            text_zh_hk: opt.option_text_zh_hk,
            next_scenario_id: opt.next_scenario_id,
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
            text: opt.option_text,
            text_zh_hk: opt.option_text_zh_hk,
            next_scenario_id: opt.next_scenario_id,
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
    
    console.log(`成功返回 ${scenarios.length} 个场景`);
    res.json(scenarios);
  } catch (error) {
    console.error('获取场景失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取单个场景
router.get('/:id', async (req, res) => {
  try {
    const scenario = await get('SELECT * FROM scenarios WHERE scenario_id = $1', [req.params.id]);
    
    if (!scenario) {
      return res.status(404).json({ error: '场景不存在' });
    }
    
    const options = await all(
      'SELECT * FROM scenario_options WHERE scenario_id = $1 ORDER BY option_id',
      [req.params.id]
    );
    
    scenario.options = options.map(opt => {
      // 检查是否有新版本的评分字段
      const hasNewScores = opt.integrity_and_honesty_score !== null && opt.integrity_and_honesty_score !== undefined;
      
      if (hasNewScores) {
        // 新版本：4个评分维度
        return {
          option_id: opt.option_id,
          text: opt.option_text,
          text_zh_hk: opt.option_text_zh_hk,
          next_scenario_id: opt.next_scenario_id,
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
          text: opt.option_text,
          text_zh_hk: opt.option_text_zh_hk,
          next_scenario_id: opt.next_scenario_id,
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
    
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

