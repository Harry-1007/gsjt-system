import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenariosAPI, candidatesAPI, resultsAPI } from '../services/api';

function Assessment() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const candidateId = localStorage.getItem('candidateId');

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log('正在加载场景...');
      console.log('API地址:', apiUrl);
      
      const response = await scenariosAPI.getAll();
      console.log('场景加载成功，数量:', response.data?.length || 0);
      
      if (!response.data || response.data.length === 0) {
        console.warn('警告：API返回的场景数组为空');
      }
      
      setScenarios(response.data || []);
      
      // 开始测试
      if (candidateId) {
        try {
          await candidatesAPI.startTest(candidateId);
        } catch (startError) {
          console.warn('开始测试失败（不影响场景加载）:', startError);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载场景失败:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const currentScenario = scenarios[currentIndex];
    const answer = {
      scenario_id: currentScenario.scenario_id,
      option_id: selectedOption,
      timestamp: new Date().toISOString(),
    };

    // 保存答案
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // 提交答案到后端
    if (candidateId) {
      try {
        await candidatesAPI.submitAnswer(
          candidateId,
          currentScenario.scenario_id,
          selectedOption
        );
      } catch (error) {
        console.error('保存答案失败:', error);
      }
    }

    // 检查是否完成
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption('');
    } else {
      // 完成测试，提交所有答案
      await submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers) => {
    try {
      const response = await resultsAPI.submit(candidateId, finalAnswers);
      // 保存结果到localStorage
      localStorage.setItem('testResult', JSON.stringify(response.data));
      navigate('/complete');
    } catch (error) {
      console.error('提交测试失败:', error);
      alert('提交失败，请重试');
    }
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

  if (scenarios.length === 0) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-4 text-lg font-medium">没有可用的场景</p>
          <div className="text-sm text-gray-500 text-left mb-4 space-y-2">
            <p className="font-semibold mb-2">可能的原因：</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>后端服务器未运行（端口3001）</li>
              <li>网络连接问题</li>
              <li>防火墙阻止了端口3001</li>
              <li>数据库中没有场景数据</li>
            </ul>
          </div>
          <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-50 rounded">
            <p>当前API地址:</p>
            <p className="font-mono">{apiUrl}</p>
          </div>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentIndex];
  const progress = ((currentIndex + 1) / scenarios.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              场景 {currentIndex + 1} / {scenarios.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 场景标题 */}
        <div className="mb-6">
          <div className="border-b-2 border-gray-200 pb-2 mb-4">
            <h2 className="text-xl font-semibold text-primary mb-2">
              第 {currentIndex + 1} 章：{currentScenario.title_zh_hk || currentScenario.title}
            </h2>
            {currentScenario.title_zh_hk && currentScenario.title !== currentScenario.title_zh_hk && (
              <p className="text-base text-gray-600 italic">
                {currentScenario.title}
              </p>
            )}
          </div>
        </div>

        {/* 场景描述 */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed mb-3">
            {currentScenario.description_zh_hk || currentScenario.description}
          </p>
          {currentScenario.description_zh_hk && currentScenario.description !== currentScenario.description_zh_hk && (
            <p className="text-gray-600 leading-relaxed italic text-sm border-l-4 border-gray-300 pl-4">
              {currentScenario.description}
            </p>
          )}
        </div>

        {/* 选项 */}
        <div className="space-y-3 mb-6">
          {currentScenario.options.map((option) => (
            <div
              key={option.option_id}
              onClick={() => setSelectedOption(option.option_id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedOption === option.option_id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 mt-1 flex-shrink-0 ${
                    selectedOption === option.option_id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedOption === option.option_id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2">{option.text_zh_hk || option.text}</div>
                  {option.text_zh_hk && option.text !== option.text_zh_hk && (
                    <div className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                      {option.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 下一步按钮 */}
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {currentIndex < scenarios.length - 1 ? '下一个场景' : '完成评估'}
        </button>
      </div>
    </div>
  );
}

export default Assessment;

