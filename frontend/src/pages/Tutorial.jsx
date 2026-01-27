import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Tutorial() {
  const [selectedOption, setSelectedOption] = useState('');
  const navigate = useNavigate();

  const sampleScenario = {
    title: '示例場景',
    description:
      '以下是示例場景，讓您熟悉作答方式。請先閱讀情境描述，然後從選項中選出最符合您做法的一項。',
    options: [
      { id: 'A', text: '選項 A：主動了解情況並尋求合適的協助。' },
      { id: 'B', text: '選項 B：暫時忽略問題，等待他人處理。' },
      { id: 'C', text: '選項 C：立即單獨作出決定，不與任何人商量。' },
      { id: 'D', text: '選項 D：先收集更多資料，再按程序處理。' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          作答示例：如何完成一個場景
        </h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">{sampleScenario.title}</h2>
          <p className="text-gray-700">{sampleScenario.description}</p>
        </div>

        <div className="space-y-3 mb-6">
          {sampleScenario.options.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedOption === option.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 mt-1 ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedOption === option.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="flex-1">{option.text}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/assessment')}
          disabled={!selectedOption}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          了解了，開始正式評估
        </button>
      </div>
    </div>
  );
}

export default Tutorial;

