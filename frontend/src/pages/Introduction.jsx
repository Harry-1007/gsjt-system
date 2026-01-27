import { useNavigate } from 'react-router-dom';

function Introduction() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">
            歡迎參加 GSJT 情境判斷測試
          </h1>
        </div>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">評估目的</h2>
            <p>
              本評估旨在了解您是否具備公共部門實習職位所需的關鍵能力與素質。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">評估內容</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>共 8 個情境場景</li>
              <li>預計完成時間：約 15–20 分鐘</li>
              <li>沒有「標準答案」</li>
              <li>請依照第一直覺選擇最貼近您做法的選項</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">重要提示</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>請盡量完成所有場景後再離開頁面</li>
              <li>作答期間不可返回修改已提交的答案</li>
              <li>您所提供的資料及答案將嚴格保密，只用作本次評估用途</li>
            </ul>
          </section>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/tutorial')}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            前往作答示例
          </button>
        </div>
      </div>
    </div>
  );
}

export default Introduction;

