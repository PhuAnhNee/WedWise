import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Answer {
  answerId: string;
  answerContent: string;
  score: number;
}

interface Question {
  questionId: string;
  questionContent: string;
  answers: Answer[];
}

interface Quiz {
  quizId: string;
  name: string;
  description: string;
  questions: Question[];
}

const QuizDetail: React.FC = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) {
      setError("Quiz ID is missing");
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await fetch(
          `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz/Get_Quiz_By_Id?id=${quizId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quiz data");
        }
        const data: Quiz = await response.json();
        setQuiz(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{quiz?.name}</h1>
      <p className="text-gray-700 mb-4">{quiz?.description}</p>

      {quiz?.questions.map((question, index) => (
        <div key={question.questionId} className="mb-6">
          <h2 className="text-lg font-semibold">{index + 1}. {question.questionContent}</h2>
          <ul className="mt-2">
            {question.answers.map((answer) => (
              <li key={answer.answerId} className="p-2 border rounded-lg mb-2">
                {answer.answerContent} - <span className="text-green-600">({answer.score} points)</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default QuizDetail;
