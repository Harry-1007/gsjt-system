// 确保先加载环境变量
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { run, all } = require('./db');

async function importScenarios() {
  try {
    // 读取scenarios.json（优先读取backend文件夹的，如果不存在则读取根目录的）
    const backendPath = path.join(__dirname, '../scenarios.json');
    const rootPath = path.join(__dirname, '../../scenarios.json');
    
    let scenariosPath;
    if (fs.existsSync(backendPath)) {
      scenariosPath = backendPath;
      console.log(`使用backend文件夹文件: ${scenariosPath}`);
    } else if (fs.existsSync(rootPath)) {
      scenariosPath = rootPath;
      console.log(`使用根目录文件: ${scenariosPath}`);
    } else {
      throw new Error(`找不到 scenarios.json 文件！已检查: ${backendPath} 和 ${rootPath}`);
    }
    
    const scenariosData = JSON.parse(
      fs.readFileSync(scenariosPath, 'utf8')
    );

    console.log('开始导入场景数据...');
    console.log(`系统版本: ${scenariosData.system_metadata.version}`);
    console.log(`场景总数: ${scenariosData.system_metadata.total_scenarios}`);
    console.log(`实际场景数组长度: ${scenariosData.scenarios ? scenariosData.scenarios.length : 0}`);
    console.log(`读取文件路径: ${scenariosPath}`);

    // 检查评分字段类型（v1.0使用旧字段，v2.0使用新字段）
    const isV2 = scenariosData.system_metadata.version === '2.0';
    const competencies = scenariosData.system_metadata.competencies || [];

    if (!scenariosData.scenarios || scenariosData.scenarios.length === 0) {
      throw new Error('场景数组为空或不存在！');
    }

    // 导入场景
    let importedCount = 0;
    for (const scenario of scenariosData.scenarios) {
      // 插入场景（使用 PostgreSQL 的 ON CONFLICT 语法）
      await run(
        `INSERT INTO scenarios (scenario_id, title, title_zh_hk, description, description_zh_hk, illustration_id, competency_tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (scenario_id) 
         DO UPDATE SET 
           title = EXCLUDED.title,
           title_zh_hk = EXCLUDED.title_zh_hk,
           description = EXCLUDED.description,
           description_zh_hk = EXCLUDED.description_zh_hk,
           illustration_id = EXCLUDED.illustration_id,
           competency_tags = EXCLUDED.competency_tags`,
        [
          scenario.scenario_id,
          scenario.title,
          scenario.title_zh_hk || null,
          scenario.description,
          scenario.description_zh_hk || null,
          scenario.illustration_id || null,
          JSON.stringify(scenario.competency_tags || [])
        ]
      );

      // 插入选项 - 先删除旧选项，再插入新选项
      await run('DELETE FROM scenario_options WHERE scenario_id = $1', [scenario.scenario_id]);
      
      for (const option of scenario.options) {
        if (isV2) {
          // 新版本：使用新的4个评分维度
          await run(
            `INSERT INTO scenario_options 
             (scenario_id, option_id, option_text, option_text_zh_hk, next_scenario_id, 
              integrity_and_honesty_score, problem_solving_under_stress_score,
              effective_communication_score, discipline_score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              scenario.scenario_id,
              option.option_id,
              option.text,
              option.text_zh_hk || null,
              option.next_scenario_id,
              option.scores.integrity_and_honesty || 0,
              option.scores.problem_solving_under_stress || 0,
              option.scores.effective_communication || 0,
              option.scores.discipline || 0
            ]
          );
        } else {
          // 旧版本：使用旧的6个评分维度
          await run(
            `INSERT INTO scenario_options 
             (scenario_id, option_id, option_text, option_text_zh_hk, next_scenario_id, 
              integrity_score, teamwork_score, service_orientation_score,
              discipline_score, problem_solving_score, stress_tolerance_score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              scenario.scenario_id,
              option.option_id,
              option.text,
              option.text_zh_hk || null,
              option.next_scenario_id,
              option.scores.integrity || 0,
              option.scores.teamwork || 0,
              option.scores.service_orientation || 0,
              option.scores.discipline || 0,
              option.scores.problem_solving || 0,
              option.scores.stress_tolerance || 0
            ]
          );
        }
      }

      console.log(`✓ 已导入: ${scenario.scenario_id} - ${scenario.title}`);
      importedCount++;
    }

    console.log(`✅ 所有场景导入完成！共导入 ${importedCount} 个场景`);
    
    // 验证数据
    const count = await all('SELECT COUNT(*) as count FROM scenarios');
    console.log(`数据库中共有 ${count[0].count} 个场景`);
    
  } catch (error) {
    console.error('导入失败:', error);
    throw error;
  }
}

importScenarios();

