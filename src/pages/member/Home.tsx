import React from "react";

const quizzes = [
  { id: 1, title: "Quiz về tâm lý học", description: "Kiểm tra hiểu biết của bạn về tâm lý học.", image: "https://th.bing.com/th/id/OIP.9cbeAPXFbAlh4huar65dhQHaE8?rs=1&pid=ImgDetMain" },
  { id: 2, title: "Quiz về tình yêu", description: "Khám phá phong cách yêu của bạn.", image: "https://th.bing.com/th/id/OIP.9cbeAPXFbAlh4huar65dhQHaE8?rs=1&pid=ImgDetMain" },
  { id: 3, title: "Quiz về hôn nhân", description: "Bạn đã sẵn sàng kết hôn chưa?", image: "https://th.bing.com/th/id/OIP.9cbeAPXFbAlh4huar65dhQHaE8?rs=1&pid=ImgDetMain" },
];

const readings = [
  { id: 1, title: "10 điều cần biết trước khi kết hôn", description: "Lời khuyên hữu ích cho các cặp đôi.", image: "https://th.bing.com/th/id/OIP.e2EmAvMNst9HvWxITjeZTAHaEK?rs=1&pid=ImgDetMain" },
  { id: 2, title: "Bí quyết giữ lửa hôn nhân", description: "Làm sao để duy trì hạnh phúc lâu dài?", image: "https://th.bing.com/th/id/OIP.e2EmAvMNst9HvWxITjeZTAHaEK?rs=1&pid=ImgDetMain" },
  { id: 3, title: "Tại sao giao tiếp là chìa khóa trong tình yêu?", description: "Học cách giao tiếp hiệu quả với bạn đời.", image: "https://th.bing.com/th/id/OIP.e2EmAvMNst9HvWxITjeZTAHaEK?rs=1&pid=ImgDetMain" },
];

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cột bên trái - Quiz phổ biến */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Popular Quizzes</h2>
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-4 border rounded-lg shadow-lg hover:shadow-xl transition bg-white flex items-center">
              <img src={quiz.image} alt={quiz.title} className="w-20 h-20 rounded-md mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-gray-600">{quiz.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột bên phải - Bài đọc phổ biến */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-green-600">Top Read</h2>
        <div className="space-y-4">
          {readings.map((reading) => (
            <div key={reading.id} className="p-4 border rounded-lg shadow-lg hover:shadow-xl transition bg-white flex items-center">
              <img src={reading.image} alt={reading.title} className="w-20 h-20 rounded-md mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{reading.title}</h3>
                <p className="text-gray-600">{reading.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;