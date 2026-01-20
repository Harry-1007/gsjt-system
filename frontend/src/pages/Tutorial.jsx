import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Tutorial() {
  const [selectedOption, setSelectedOption] = useState('');
  const navigate = useNavigate();

  const sampleScenario = {
    title: '示例场景',
    description: '这是一个示例场景。请仔细阅读情况描述，选择最能代表您会如何回应的选项。',
    options: [
      { id: 'A', text: '选项A：第一个响应选项' },
      { id: 'B', text: '选项B：第二个响应选项' },
      { id: 'C', text: '选项C：第三个响应选项' },
      { id: 'D', text: '选项D：第四个响应选项' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          教程：示例场景
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
          继续到正式评估
        </button>
      </div>
    </div>
  );
}

export default Tutorial;

