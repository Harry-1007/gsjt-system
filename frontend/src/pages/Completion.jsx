import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Completion() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedResult = localStorage.getItem('testResult');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            评估完成
          </h1>
        </div>

        <div className="text-gray-700 space-y-4 mb-8">
          <p>
            感谢您完成情境判断测试。
          </p>
          <p>
            您的回答已记录，将由评估小组作为PMP实习项目选拔流程的一部分进行审核。
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">下一步</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• 您将很快收到确认邮件</li>
            <li>• 结果将在5-7个工作日内审核</li>
            <li>• 进一步通知将发送至您注册的邮箱地址</li>
          </ul>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          返回首页
        </button>

        <p className="mt-6 text-sm text-gray-500">
          如有问题，请联系：recruitment@pmp.gov.hk
        </p>
      </div>
    </div>
  );
}

export default Completion;

