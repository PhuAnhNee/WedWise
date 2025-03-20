import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Radio, Typography, Spin, notification, Empty, Tag, Progress } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import axios from "axios";
import AuthService from "../service/AuthService";

const { Title, Text, Paragraph } = Typography;

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

interface TherapistSpecialty {
  therapistId: string;
  // Additional specialty fields if needed
}

interface TherapistSuggestion {
  therapistId: string;
  therapistName: string;
  avatar: string;
  description: string;
  consultationFee: number;
  specialty: TherapistSpecialty[];
  meetUrl: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface QuizAnswer {
  memberId: string;
  questionId: string;
  answerId: string;
}

// Interface for detailed quiz result
interface QuizResult {
  quizResultId: string;
  quizId: string;
  description: string;
  level: number; // Changed from string to number
  title: string;
  score: number;
}

// Enhanced response interface to include quiz results
interface SuggestionResponse {
  therapists: {
    [quizId: string]: TherapistSuggestion[];
  };
  quizResult?: QuizResult;
}

const QuizSubmission: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [suggestedTherapists, setSuggestedTherapists] = useState<TherapistSuggestion[]>([]);
  const [showResults, setShowResults] = useState(false);
  // New state for quiz result
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

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

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const showSuccessNotification = () => {
    api.success({
      message: "Gửi bài thành công",
      description: "Chúng tôi đã phân tích đáp án của bạn và gợi ý các chuyên gia phù hợp!",
      icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
      placement: "topRight",
      duration: 3,
      style: {
        backgroundColor: "#f6ffed",
        border: "1px solid #b7eb8f",
      },
    });
  };

  const showErrorNotification = (errorMessage: string) => {
    api.error({
      message: "Gửi bài thất bại",
      description: errorMessage,
      icon: <CloseCircleFilled style={{ color: "#ff4d4f" }} />,
      placement: "topRight",
      duration: 4,
      style: {
        backgroundColor: "#fff2f0",
        border: "1px solid #ffccc7",
      },
    });
  };

  // Function to determine level color
  const getLevelColor = (level: number | string): string => {
    // Handle numeric levels
    if (typeof level === 'number') {
      switch (level) {
        case 3: return 'orange';    // High
        case 2: return 'yellow'; // Medium
        case 1: return 'green';  // Low
        default: return 'red';
      }
    }
    
    // Fallback for string levels (if you still want to support them)
    if (typeof level === 'string') {
      switch (level.toLowerCase()) {
        case 'cao':
        case 'high':
          return 'orange';
        case 'trung bình':
        case 'medium':
          return 'yellow';
        case 'thấp':
        case 'low': 
          return 'green';
        default:
          return 'red';
      }
    }
    
    return 'red'; // Default fallback
  };

  const handleSubmit = async () => {
    const decodedToken = AuthService.getDecodedToken();
    
    if (!decodedToken) {
      showErrorNotification("Bạn cần đăng nhập để gửi bài làm");
      return;
    }

    if (!quiz || Object.keys(userAnswers).length !== quiz.questions.length) {
      showErrorNotification("Vui lòng trả lời tất cả các câu hỏi");
      return;
    }

    const memberAnswers: QuizAnswer[] = Object.entries(userAnswers).map(([questionId, answerId]) => ({
      memberId: decodedToken.UserId,
      questionId,
      answerId,
    }));

    setSubmitting(true);
    try {
      const response = await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/MemberAnswer/Save_Member_Answer",
        memberAnswers,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      console.log("Submit response:", response.data);
      showSuccessNotification();
      
      // Parse the nested response structure
      const responseData: SuggestionResponse = response.data;
      
      // Extract therapists from the response
      let therapists: TherapistSuggestion[] = [];
if (responseData && typeof responseData === 'object') {
  // Check if therapists is an array (which it is in your response)
  if (Array.isArray(responseData.therapists)) {
    therapists = responseData.therapists;
  } 
  // Keep your existing logic as a fallback
  else if (responseData.therapists && typeof responseData.therapists === 'object') {
    Object.keys(responseData.therapists).forEach(key => {
      if (Array.isArray(responseData.therapists[key])) {
        therapists = [...therapists, ...responseData.therapists[key]];
      }
    });
  }
}
      
      // Extract quiz result from the response
      if (responseData.quizResult) {
        setQuizResult(responseData.quizResult);
      }
      
      console.log("Extracted therapists:", therapists);
      console.log("Quiz result:", responseData.quizResult);
      setSuggestedTherapists(therapists);
      setShowResults(true);
    } catch (error: any) {
      console.error("Submit error:", error);
      let errorMessage = "Đã có lỗi xảy ra khi gửi bài làm";
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = typeof error.response.data === "string" 
          ? error.response.data 
          : error.response.data?.message || errorMessage;
      }
      
      showErrorNotification(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToTherapist = (therapistId: string) => {
    navigate(`/home/therapist/${therapistId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải bài trắc nghiệm..." />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 p-4">Lỗi: {error}</p>;
  }

  if (!quiz) {
    return <p className="text-center text-red-500 p-4">Không tìm thấy bài trắc nghiệm</p>;
  }

  return (
    <>
      {contextHolder}
      <div className="max-w-4xl mx-auto p-6">
        {!showResults ? (
          <Card className="shadow-lg">
            <Title level={2} className="text-center">{quiz.name}</Title>
            <Text className="block mb-6 text-center">{quiz.description}</Text>

            {quiz.questions.map((question, index) => (
              <Card key={question.questionId} className="mb-6 shadow">
                <Title level={4}>
                  Câu {index + 1}: {question.questionContent}
                </Title>
                <Radio.Group
                  onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                  value={userAnswers[question.questionId]}
                  className="w-full"
                >
                  {question.answers.map((answer) => (
                    <Radio 
                      key={answer.answerId} 
                      value={answer.answerId}
                      className="block my-2 p-2 border rounded hover:bg-gray-50"
                    >
                      {answer.answerContent}
                    </Radio>
                  ))}
                </Radio.Group>
              </Card>
            ))}

            <Button
              type="primary"
              size="large"
              className="w-full mt-4"
              onClick={handleSubmit}
              loading={submitting}
            >
              {submitting ? "Đang xử lý..." : "Gửi bài làm"}
            </Button>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <Title level={2} className="text-center">Kết quả trắc nghiệm</Title>
            
            {/* Quiz result section */}
            {quizResult && (
              <Card className="mb-6 border-2 shadow-md">
                <div className="text-center mb-4">
                  <Tag color={getLevelColor(quizResult.level)} className="px-3 py-1 text-base mb-4">
                    Mức độ: {quizResult.level}
                  </Tag>
                  
                  <div className="mb-4">
                    <Text strong className="text-lg">Điểm số của bạn</Text>
                    <Progress 
                      type="circle" 
                      percent={quizResult.score} 
                      format={percent => `${percent}%`}
                      strokeColor={getLevelColor(quizResult.level)}
                      className="my-4"
                    />
                  </div>
                  
                  <Card bordered={false} className="bg-gray-50">
                    <Title level={4} className="mb-3">Nhận xét</Title>
                    <Paragraph className="text-left">{quizResult.description}</Paragraph>
                  </Card>
                </div>
              </Card>
            )}
            
            <Text className="block mb-6 text-center">
              Dựa trên câu trả lời của bạn, chúng tôi gợi ý các chuyên gia sau đây:
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {suggestedTherapists && suggestedTherapists.length > 0 ? (
                suggestedTherapists.map((therapist) => (
                  <Card 
                    key={therapist.therapistId} 
                    hoverable 
                    className="shadow cursor-pointer"
                    onClick={() => navigateToTherapist(therapist.therapistId)}
                  >
                    <div className="flex flex-col items-center">
                      <img 
                        src={therapist.avatar || "default-avatar.png"} 
                        alt={therapist.therapistName} 
                        className="w-24 h-24 rounded-full mb-4 object-cover"
                      />
                      <Title level={4}>{therapist.therapistName}</Title>
                      <Text className="text-center mb-2">{therapist.description}</Text>
                      <Text type="success">Phí tư vấn: {therapist.consultationFee} VND</Text>
                      <Button type="link" className="mt-2">Xem chi tiết</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2">
                  <Empty 
                    description="Không có chuyên gia phù hợp dựa trên kết quả của bạn" 
                    className="my-8"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6">
              <Button 
                type="primary" 
                onClick={() => navigate("/home/therapist")}
              >
                Xem tất cả chuyên gia
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default QuizSubmission;