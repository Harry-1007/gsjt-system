const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database/db');

// 开始测试
router.post('/:id/start', async (req, res) => {
  try {
    const candidate_id = req.params.id;
    
    // 检查是否已有记录
    const existing = await get(
      'SELECT * FROM candidate_results WHERE candidate_id = $1',
      [candidate_id]
    );
    
    if (existing) {
      // 如果已存在，只更新 started_at（如果还没有）和重置answers
      if (!existing.started_at) {
        await run(
          'UPDATE candidate_results SET started_at = NOW(), answers = $1 WHERE candidate_id = $2',
          ['[]', candidate_id]
        );
      } else {
        // 如果已有started_at，只重置answers（允许重新开始）
        await run(
          'UPDATE candidate_results SET answers = $1 WHERE candidate_id = $2',
          ['[]', candidate_id]
        );
      }
      res.json({ success: true, test_id: existing.test_id, candidate_id });
    } else {
      // 插入新记录
      const test_id = `GSJT-${Date.now()}`;
      await run(
        `INSERT INTO candidate_results 
         (candidate_id, test_id, started_at, answers)
         VALUES ($1, $2, NOW(), $3)`,
        [candidate_id, test_id, '[]']
      );
      res.json({ success: true, test_id, candidate_id });
    }
  } catch (error) {
    console.error('开始测试错误:', error);
    console.error('错误堆栈:', error.stack);
    console.error('候选人ID:', req.params.id);
    
    // 如果是唯一约束错误，尝试更新现有记录
    if (error.message && error.message.includes('UNIQUE constraint')) {
      try {
        const existing = await get(
          'SELECT * FROM candidate_results WHERE candidate_id = $1',
          [req.params.id]
        );
        if (existing) {
          await run(
            'UPDATE candidate_results SET started_at = NOW(), answers = $1 WHERE candidate_id = $2',
            ['[]', req.params.id]
          );
          return res.json({ success: true, test_id: existing.test_id, candidate_id: req.params.id });
        }
      } catch (updateError) {
        console.error('更新现有记录失败:', updateError);
      }
    }
    
    res.status(500).json({ 
      error: error.message || '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 保存单个答案
router.post('/:id/answer', async (req, res) => {
  try {
    const { scenario_id, option_id } = req.body;
    const candidate_id = req.params.id;
    
    if (!scenario_id || !option_id) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 获取当前答案
    const result = await get(
      'SELECT answers FROM candidate_results WHERE candidate_id = $1',
      [candidate_id]
    );
    
    if (!result) {
      // 如果测试未开始，自动开始测试
      const test_id = `GSJT-${Date.now()}`;
      await run(
        `INSERT INTO candidate_results 
         (candidate_id, test_id, started_at, answers)
         VALUES ($1, $2, NOW(), $3)`,
        [candidate_id, test_id, '[]']
      );
      
      // 重新获取
      const newResult = await get(
        'SELECT answers FROM candidate_results WHERE candidate_id = $1',
        [candidate_id]
      );
      
      let answers = JSON.parse(newResult.answers || '[]');
      const answer = {
        scenario_id,
        option_id,
        timestamp: new Date().toISOString()
      };
      answers.push(answer);
      
      await run(
        'UPDATE candidate_results SET answers = $1 WHERE candidate_id = $2',
        [JSON.stringify(answers), candidate_id]
      );
      
      return res.json({ success: true });
    }
    
    let answers = JSON.parse(result.answers || '[]');
    
    // 更新或添加答案
    const existingIndex = answers.findIndex(a => a.scenario_id === scenario_id);
    const answer = {
      scenario_id,
      option_id,
      timestamp: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      answers[existingIndex] = answer;
    } else {
      answers.push(answer);
    }
    
    // 更新数据库
    await run(
      'UPDATE candidate_results SET answers = $1 WHERE candidate_id = $2',
      [JSON.stringify(answers), candidate_id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('保存答案错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: error.message || '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

