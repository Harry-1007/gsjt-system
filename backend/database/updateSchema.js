const { run, all, pool } = require('./db');

async function updateSchema() {
  try {
    console.log('开始更新数据库结构...');

    // 检查并添加 scenarios 表的字段
    try {
      const scenarioColumns = await all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'scenarios'
      `);
      const columnNames = scenarioColumns.map(col => col.column_name);
      
      if (!columnNames.includes('title_zh_hk')) {
        await run('ALTER TABLE scenarios ADD COLUMN title_zh_hk TEXT');
        console.log('✓ 已添加 scenarios.title_zh_hk 字段');
      } else {
        console.log('✓ scenarios.title_zh_hk 字段已存在');
      }

      if (!columnNames.includes('description_zh_hk')) {
        await run('ALTER TABLE scenarios ADD COLUMN description_zh_hk TEXT');
        console.log('✓ 已添加 scenarios.description_zh_hk 字段');
      } else {
        console.log('✓ scenarios.description_zh_hk 字段已存在');
      }
    } catch (error) {
      console.error('更新 scenarios 表时出错:', error.message);
    }

    // 检查并添加 scenario_options 表的字段
    try {
      const optionColumns = await all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'scenario_options'
      `);
      const optionColumnNames = optionColumns.map(col => col.column_name);
      
      if (!optionColumnNames.includes('option_text_zh_hk')) {
        await run('ALTER TABLE scenario_options ADD COLUMN option_text_zh_hk TEXT');
        console.log('✓ 已添加 scenario_options.option_text_zh_hk 字段');
      } else {
        console.log('✓ scenario_options.option_text_zh_hk 字段已存在');
      }
    } catch (error) {
      console.error('更新 scenario_options 表时出错:', error.message);
    }

    console.log('✅ 数据库结构更新完成！');
    console.log('\n现在可以运行导入脚本：');
    console.log('node database/importScenarios.js');
    
  } catch (error) {
    console.error('更新数据库结构失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('数据库连接已关闭');
    process.exit(0);
  }
}

updateSchema();

