import React, { useState, useEffect } from "react";
import { Card, Button, Spin, message, Typography, Empty } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

// Define proper interfaces for the quiz data
interface Quiz {
  quizId: string;
  title: string;
  description: string;
  questionCount?: number;
}

const API_URL =
  "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz/Get_All_Quiz";

const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get<Quiz[]>(API_URL);
      setQuizzes(response.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách quiz!");
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="text-center mb-10">
        <Title level={2} className="!text-3xl md:!text-4xl font-bold text-indigo-700">
          Danh sách bài Quiz
        </Title>
        <Paragraph className="text-gray-500 max-w-xl mx-auto">
          Hãy hoàn thành các bài quiz dưới đây để hiểu rõ hơn về bản thân và đối tác của bạn.
        </Paragraph>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Đang tải danh sách quiz..." />
        </div>
      ) : quizzes.length === 0 ? (
        <Empty description="Không có bài quiz nào" className="my-16" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.quizId}
              hoverable
              className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden"
              cover={
                <div className="h-40 relative flex items-center justify-center p-4">
                  <img
                    src="https://i.pinimg.com/236x/6f/e9/92/6fe9921cc598b7576390acf0439b8492.jpg"
                    alt={quiz.title}
                    className="w-full h-full object-cover absolute top-0 left-0"
                  />
                  <Title level={4} className="!text-white text-center m-0 z-10">
                    {quiz.title}
                  </Title>
                </div>
              }
            >
              <div className="p-2">
                <Paragraph className="text-gray-600 h-20 overflow-hidden text-sm">
                  {quiz.description || "Hãy thực hiện bài quiz này để khám phá thêm về mối quan hệ của bạn."}
                </Paragraph>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">
                    {quiz.questionCount ?? "N/A"} câu hỏi
                  </span>
                  <Button
                    type="primary"
                    className="bg-indigo-600 hover:bg-indigo-700 border-none"
                    onClick={() => navigate(`/home/quiz/${quiz.quizId}`)}
                  >
                    Bắt đầu
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage;