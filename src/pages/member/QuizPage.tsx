import React, { useState, useEffect } from "react";
import { Card, Button, Spin, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz/Get_All_Quiz";

const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(API_URL);
      setQuizzes(response.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách quiz!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Danh sách bài Quiz</h1>

      {loading ? (
        <Spin size="large" className="flex justify-center" />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} title={quiz.title} className="shadow-lg">
              <p className="text-gray-500">{quiz.description}</p>
              <Button
                type="primary"
                className="mt-3 w-full"
                onClick={() => navigate(`/home/quiz/${quiz.quizId}`)}
              >
                Bắt đầu
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
