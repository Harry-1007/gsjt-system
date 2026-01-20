const { get, pool } = require('./db');

async function inspectLastResult() {
  try {
    const row = await get(
      "SELECT candidate_id, test_id, completed_at, total_scores FROM candidate_results ORDER BY completed_at DESC LIMIT 1"
    );
    
    if (!row) {
      console.log('没有找到任何结果记录。');
    } else {
      console.log('最新一条结果记录:');
      console.log(`candidate_id: ${row.candidate_id}`);
      console.log(`test_id: ${row.test_id}`);
      console.log(`completed_at: ${row.completed_at}`);
      try {
        const scores = JSON.parse(row.total_scores || '{}');
        console.log('total_scores 对象:');
        console.dir(scores, { depth: null });
      } catch (e) {
        console.error('解析 total_scores 失败:', e);
        console.log('原始 total_scores 字符串:', row.total_scores);
      }
    }
  } catch (err) {
    console.error('查询失败:', err);
  } finally {
    await pool.end();
  }
}

inspectLastResult();


