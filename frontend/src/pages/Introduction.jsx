import { useNavigate } from 'react-router-dom';

function Introduction() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">
            欢迎参加GSJT评估
          </h1>
        </div>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">目的</h2>
            <p>
              本评估旨在评估公共部门实习岗位所需的关键能力素质。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">评估内容</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>8个情境场景</li>
              <li>预计时间：15-20分钟</li>
              <li>没有标准答案</li>
              <li>请根据第一直觉回答</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">重要提示</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>请完成所有场景</li>
              <li>无法返回修改之前的答案</li>
              <li>您的回答将被严格保密</li>
            </ul>
          </section>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/tutorial')}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            继续到教程
          </button>
        </div>
      </div>
    </div>
  );
}

export default Introduction;

