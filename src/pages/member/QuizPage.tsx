import React, { useState, useEffect } from "react";
import { Card, Button, message, Typography, Empty, Skeleton } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarChartOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

// Define proper interfaces for the quiz data
interface Quiz {
  quizId: string;
  title: string;
  description: string;
  questionCount?: number;
  category?: string | CategoryObject;
  difficulty?: "easy" | "medium" | "hard";
  estimatedTime?: string;
}

// Define category object interface based on the error message
interface CategoryObject {
  categoryId: string;
  name: string;
  description: string;
  status: string;
  quizzes: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  createdUser: string;
  updatedUser: string;
}

const API_URL =
  "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz/Get_All_Quiz";

const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get<Quiz[]>(API_URL);
      // Simulate adding more data to enhance the UI
      const enhancedQuizzes = response.data.map((quiz) => ({
        ...quiz,
        category: quiz.category || ["Relationship", "Communication", "Compatibility", "Values"][Math.floor(Math.random() * 4)],
        difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as "easy" | "medium" | "hard",
        estimatedTime: `${Math.floor(Math.random() * 20) + 5} phút`,
      }));
      setQuizzes(enhancedQuizzes);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách quiz!");
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract category display name from category object or string
  const getCategoryDisplayName = (category: string | CategoryObject | undefined): string => {
    if (!category) return "Uncategorized";
    if (typeof category === "string") return category;
    return category.name || "Uncategorized";
  };

  // Extract unique categories and ensure they are strings
  const uniqueCategories = Array.from(
    new Set(
      quizzes.map((quiz) => getCategoryDisplayName(quiz.category))
    )
  );

  // Ensure categories are properly formatted as strings
  const categories = ["all", ...uniqueCategories];

  // Filter quizzes by category
  const filteredQuizzes =
    activeCategory === "all"
      ? quizzes
      : quizzes.filter((quiz) => getCategoryDisplayName(quiz.category) === activeCategory);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-[2000px] mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <Title level={2} className="!text-3xl md:!text-4xl font-bold text-indigo-700 mb-4">
          Danh sách bài Quiz
        </Title>
        <Paragraph className="text-gray-600 max-w-xl mx-auto text-lg">
          Hãy hoàn thành các bài quiz dưới đây để hiểu rõ hơn về bản thân và đối tác của bạn.
        </Paragraph>
      </motion.div>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {categories.map((category, index) => (
          <Button
            key={`category-${index}-${category}`}
            type={activeCategory === category ? "primary" : "default"}
            shape="round"
            onClick={() => setActiveCategory(category)}
            className={`${activeCategory === category ? "bg-indigo-600 hover:bg-indigo-700" : "hover:border-indigo-600 hover:text-indigo-600"
              } transition-colors duration-300 min-w-24`}
          >
            {category === "all" ? "Tất cả" : category}
          </Button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={`skeleton-${index}`} className="shadow-md border border-gray-200 rounded-lg overflow-hidden">
              <Skeleton.Image active className="w-full h-40" />
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Empty
          description="Không có bài quiz nào"
          className="my-16"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={`quiz-${quiz.quizId || index}`}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1 }
                }
              }}
            >
              <Card
                hoverable
                className="shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col"
                cover={
                  <div className="h-48 relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/70 group-hover:from-transparent group-hover:to-indigo-900/90 transition-all duration-300"></div>
                    <img
                      src={`https://i.pinimg.com/736x/37/4a/92/374a928711a6cf28b7d3a4b9014a7edd.jpg?relationship,couple,love,${index}`}
                      alt={quiz.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                      <Title level={4} className="!text-white text-center m-0 group-hover:text-indigo-200 transition-colors duration-300">
                        {quiz.title}
                      </Title>
                    </div>
                  </div>
                }
              >
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty === "easy"
                        ? "Dễ"
                        : quiz.difficulty === "medium"
                          ? "Trung bình"
                          : "Khó"}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {getCategoryDisplayName(quiz.category)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {quiz.estimatedTime}
                    </span>
                  </div>

                  <Paragraph className="text-gray-600 mb-4 flex-grow">
                    {quiz.description || "Hãy thực hiện bài quiz này để khám phá thêm về mối quan hệ của bạn."}
                  </Paragraph>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center">
                      <BarChartOutlined className="text-indigo-600 mr-1" />
                      <span className="text-sm text-gray-600">
                        {quiz.questionCount || Math.floor(Math.random() * 15) + 5} câu hỏi
                      </span>
                    </div>
                    <Button
                      type="primary"
                      className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-md hover:shadow-indigo-300/50"
                      onClick={() => navigate(`/home/quiz/${quiz.quizId}`)}
                    >
                      <span className="flex items-center">
                        <CheckCircleOutlined className="mr-1" /> Bắt đầu
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default QuizPage;