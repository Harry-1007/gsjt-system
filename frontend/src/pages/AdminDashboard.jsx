import { useState, useEffect } from 'react';
import { resultsAPI } from '../services/api';

function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await resultsAPI.getAll();
      
      if (Array.isArray(response.data)) {
        setResults(response.data);
      } else {
        console.error('响应数据不是数组:', response.data);
        setResults([]);
      }
      setSelectedItems(new Set()); // 清空选中项
      setLoading(false);
    } catch (error) {
      console.error('加载结果失败:', error);
      setResults([]);
      setLoading(false);
    }
  };

  // 删除结果（单个或批量）
  const handleDelete = async (candidateId = null) => {
    const itemsToDelete = candidateId 
      ? [candidateId] 
      : Array.from(selectedItems);
    
    if (itemsToDelete.length === 0) {
      alert('请选择要删除的记录');
      return;
    }

    const message = itemsToDelete.length === 1
      ? '确定要删除这条测试结果吗？此操作无法撤销。'
      : `确定要删除选中的 ${itemsToDelete.length} 条测试结果吗？此操作无法撤销。`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      // 批量删除
      const deletePromises = itemsToDelete.map(id => resultsAPI.delete(id));
      await Promise.all(deletePromises);
      
      // 清空选中项
      setSelectedItems(new Set());
      
      // 重新加载数据
      await loadResults();
      alert(`成功删除 ${itemsToDelete.length} 条记录`);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + (error.response?.data?.error || error.message));
    }
  };

  // 切换单个选中状态
  const toggleSelect = (candidateId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    setSelectedItems(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.size === results.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(results.map(r => r.candidate_id)));
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Highly Recommended':
        return 'bg-green-100 text-green-800';
      case 'Recommended':
        return 'bg-blue-100 text-blue-800';
      case 'Borderline':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Recommended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 导出 CSV 功能
  const exportToCSV = () => {
    if (results.length === 0) {
      alert('没有数据可导出');
      return;
    }

    // CSV 表头
    const headers = [
      '候选人ID',
      '测试ID',
      '总分',
      '评级',
      'Category A (Personnel & PR)',
      'Category B (Regional)',
      'Category C (Technical & Management)',
      'Integrity & Honesty',
      'Problem-solving under Stress',
      'Effective Communication',
      'Discipline',
      '完成时间',
      '开始时间'
    ];

    // 转换数据为 CSV 行
    const csvRows = results.map((result) => {
      const scores = typeof result.total_scores === 'string' 
        ? JSON.parse(result.total_scores) 
        : result.total_scores;
      
      const categoryTotals = scores?.category_totals || {};
      
      // 处理 CSV 中的特殊字符（逗号、引号、换行符）
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      return [
        escapeCSV(result.candidate_id),
        escapeCSV(result.test_id),
        escapeCSV(scores?.total || 'N/A'),
        escapeCSV(result.rating || 'N/A'),
        escapeCSV(categoryTotals.A || 0),
        escapeCSV(categoryTotals.B || 0),
        escapeCSV(categoryTotals.C || 0),
        escapeCSV(scores?.integrity_and_honesty || 'N/A'),
        escapeCSV(scores?.problem_solving_under_stress || 'N/A'),
        escapeCSV(scores?.effective_communication || 'N/A'),
        escapeCSV(scores?.discipline || 'N/A'),
        escapeCSV(result.completed_at != null
          ? new Date(result.completed_at).toLocaleString('zh-CN')
          : result.started_at != null 
            ? '进行中' 
            : '未开始'),
        escapeCSV(result.started_at 
          ? new Date(result.started_at).toLocaleString('zh-CN')
          : 'N/A')
      ].join(',');
    });

    // 添加 BOM 以支持中文 Excel 正确显示
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...csvRows
    ].join('\n');

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `测试结果_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理 URL 对象
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">管理员面板</h1>
            <div className="flex items-center gap-3">
              {selectedItems.size > 0 && (
                <button
                  onClick={() => handleDelete()}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除选中 ({selectedItems.size})
                </button>
              )}
              <button
                onClick={exportToCSV}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出 CSV
              </button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">总测试数</h3>
              <p className="text-3xl font-bold text-primary">{results.length}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">已完成</h3>
              <p className="text-3xl font-bold text-green-600">
                {results.filter(r => r.completed_at != null).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">未完成</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {results.filter(r => r.completed_at == null).length}
              </p>
            </div>
          </div>

          {/* 结果表格 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={results.length > 0 && selectedItems.size === results.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    候选人ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    测试ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完成时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => {
                  const scores = typeof result.total_scores === 'string' 
                    ? JSON.parse(result.total_scores) 
                    : result.total_scores;
                  
                  const isSelected = selectedItems.has(result.candidate_id);
                  
                  return (
                    <tr key={result.candidate_id} className={isSelected ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(result.candidate_id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.candidate_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.test_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {scores?.total || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(result.rating)}`}>
                          {result.rating || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.completed_at != null
                          ? new Date(result.completed_at).toLocaleString('zh-CN')
                          : result.started_at != null 
                            ? '进行中' 
                            : '未开始'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const detail = {
                                candidate_id: result.candidate_id,
                                test_id: result.test_id,
                                scores: scores,
                                rating: result.rating,
                                answers: typeof result.answers === 'string' 
                                  ? JSON.parse(result.answers) 
                                  : result.answers
                              };

                              const cat = detail.scores?.category_totals || {};
                              const msgLines = [
                                `候选人ID: ${detail.candidate_id}`,
                                `测试ID: ${detail.test_id}`,
                                '',
                                `总分: ${detail.scores?.total ?? 'N/A'}`,
                                '',
                                '按 Category 的总分：',
                                `- A (Personnel & PR 项目): ${cat.A ?? 0}`,
                                `- B (Regional 项目): ${cat.B ?? 0}`,
                                `- C (Technical & Management 项目): ${cat.C ?? 0}`,
                                '',
                                '按能力维度的总分：',
                                `- Integrity & honesty: ${detail.scores?.integrity_and_honesty ?? 'N/A'}`,
                                `- Problem-solving under stress: ${detail.scores?.problem_solving_under_stress ?? 'N/A'}`,
                                `- Effective communication: ${detail.scores?.effective_communication ?? 'N/A'}`,
                                `- Discipline: ${detail.scores?.discipline ?? 'N/A'}`,
                                '',
                                `系统 rating: ${detail.rating ?? 'N/A'}`
                              ];

                              alert(msgLines.join('\n'));
                            }}
                            className="text-primary hover:text-blue-700"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => handleDelete(result.candidate_id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="删除此条记录"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无结果数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

