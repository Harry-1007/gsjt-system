const { run, all, pool } = require('./db');

async function deleteOldScenarios() {
  try {
    // 新的30个场景ID
    const newScenarioIds = [];
    for (let i = 1; i <= 10; i++) {
      newScenarioIds.push(`SCENARIO_A${String(i).padStart(3, '0')}`);
      newScenarioIds.push(`SCENARIO_B${String(i).padStart(3, '0')}`);
      newScenarioIds.push(`SCENARIO_C${String(i).padStart(3, '0')}`);
    }
    
    console.log('新的30个场景ID：');
    newScenarioIds.forEach(id => console.log(`  - ${id}`));
    
    // 获取所有场景
    const allScenarios = await all('SELECT scenario_id, title FROM scenarios ORDER BY scenario_id');
    console.log(`\n数据库中共有 ${allScenarios.length} 个场景`);
    
    // 找出旧场景（不在新30个场景列表中的）
    const existingIds = allScenarios.map(s => s.scenario_id);
    const oldScenarios = existingIds.filter(id => !newScenarioIds.includes(id));
    
    if (oldScenarios.length === 0) {
      console.log('\n✅ 没有发现旧场景，所有场景都是新的30个场景。');
      process.exit(0);
    }
    
    console.log(`\n发现 ${oldScenarios.length} 个旧场景需要删除：`);
    oldScenarios.forEach(id => {
      const scenario = allScenarios.find(s => s.scenario_id === id);
      console.log(`  - ${id}: ${scenario ? scenario.title : '未知'}`);
    });
    
    // 删除旧场景的选项
    console.log('\n正在删除旧场景的选项...');
    for (const oldId of oldScenarios) {
      await run('DELETE FROM scenario_options WHERE scenario_id = $1', [oldId]);
      console.log(`  ✓ 已删除 ${oldId} 的选项`);
    }
    
    // 删除旧场景
    console.log('\n正在删除旧场景...');
    for (const oldId of oldScenarios) {
      await run('DELETE FROM scenarios WHERE scenario_id = $1', [oldId]);
      console.log(`  ✓ 已删除场景: ${oldId}`);
    }
    
    // 验证删除结果
    const remainingScenarios = await all('SELECT scenario_id, title FROM scenarios ORDER BY scenario_id');
    console.log(`\n✅ 删除完成！现在数据库中共有 ${remainingScenarios.length} 个场景：`);
    remainingScenarios.forEach((s, index) => {
      console.log(`  ${index + 1}. ${s.scenario_id} - ${s.title}`);
    });
    
    if (remainingScenarios.length === 30) {
      console.log('\n✅ 完美！数据库现在只包含新的30个场景。');
    } else {
      console.log(`\n⚠️  警告：场景数量不是30个，请检查。`);
    }
    
  } catch (error) {
    console.error('删除失败:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('数据库连接已关闭');
    process.exit(0);
  }
}

deleteOldScenarios();

