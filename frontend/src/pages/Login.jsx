import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [candidateId, setCandidateId] = useState('');
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (candidateId && accepted) {
      // 保存候选人ID到localStorage
      localStorage.setItem('candidateId', candidateId);
      navigate('/intro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            PMP 實習計劃
          </h1>
          <h2 className="text-xl text-gray-600">
            情境判斷測試（GSJT）
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              申請編號或電郵地址
            </label>
            <input
              type="text"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="請輸入您的申請編號或電郵地址"
              required
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 mr-2"
              required
            />
            <label htmlFor="accept" className="text-sm text-gray-600">
              本人已閱讀並同意私隱政策及評估條款
            </label>
          </div>

          <button
            type="submit"
            disabled={!candidateId || !accepted}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            開始評估
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

