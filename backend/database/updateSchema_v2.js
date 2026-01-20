const { run, pool } = require('./db');

async function updateSchema() {
  try {
    console.log('开始更新数据库schema以支持新的评分维度...');

    // 添加新的评分字段（如果不存在）
    const newFields = [
      'integrity_and_honesty_score',
      'problem_solving_under_stress_score',
      'effective_communication_score'
    ];

    for (const field of newFields) {
      try {
        await run(`ALTER TABLE scenario_options ADD COLUMN ${field} INTEGER DEFAULT 0`);
        console.log(`✓ 已添加字段: ${field}`);
      } catch (error) {
        if (error.message.includes('duplicate column')) {
          console.log(`- 字段已存在: ${field}`);
        } else {
          throw error;
        }
      }
    }

    // discipline_score 字段已存在，不需要添加

    console.log('✅ Schema更新完成！');
  } catch (error) {
    console.error('Schema更新失败:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateSchema();

