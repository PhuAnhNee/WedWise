import React, { useState, useEffect } from "react";
import { Card, Button, message, Typography, Empty, Skeleton } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarChartOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

// Define interfaces based on the API response
interface Quiz {
  quizId: string;
  name: string;
  description: string;
  category: CategoryObject | null;
  questions: string[];
  questionCount?: number;
  estimatedTime?: string;
}

interface CategoryObject {
  categoryId: string;
  name: string;
  description: string;
  status: number;
  quizzes: (string | null)[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  createdUser: string | null;
  updatedUser: string | null;
}

const API_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz/Get_All_Quiz";

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
      // Process the API data to include question count and estimated time
      const enhancedQuizzes = response.data.map((quiz) => {
        const questionCount = quiz.questions?.length || 0;
        const totalSeconds = questionCount * 30;
        const minutes = Math.round(totalSeconds / 60); // Round to nearest minute
        const estimatedTime = `${minutes} minutes`;

        return {
          ...quiz,
          questionCount,
          estimatedTime,
        };
      });
      setQuizzes(enhancedQuizzes);
    } catch (error) {
      message.error("Error fetching quiz list!");
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract category display name with fallback
  const getCategoryDisplayName = (category: CategoryObject | null | undefined): string => {
    return category?.name || "Uncategorized";
  };

  // Extract unique categories
  const uniqueCategories = Array.from(
    new Set(quizzes.map((quiz) => getCategoryDisplayName(quiz.category)))
  );

  const categories = ["all", ...uniqueCategories];

  // Filter quizzes by category
  const filteredQuizzes =
    activeCategory === "all"
      ? quizzes
      : quizzes.filter((quiz) => getCategoryDisplayName(quiz.category) === activeCategory);

  return (
    <div className="max-w-[2000px] mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <Title level={2} className="!text-3xl md:!text-4xl font-bold text-indigo-700 mb-4">
          Quiz List
        </Title>
        <Paragraph className="text-gray-600 max-w-xl mx-auto text-lg">
          Complete the quizzes below to better understand yourself and your partner.
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
            className={`${activeCategory === category ? "bg-indigo-600 hover:bg-indigo-700" : "hover:border-indigo-600 hover:text-indigo-600"} transition-colors duration-300 min-w-24`}
          >
            {category === "all" ? "All" : category}
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
          description="No quizzes available"
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
                visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
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
                      alt={quiz.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                      <Title level={4} className="!text-white text-center m-0 group-hover:text-indigo-200 transition-colors duration-300">
                        {quiz.name}
                      </Title>
                    </div>
                  </div>
                }
              >
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {getCategoryDisplayName(quiz.category)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {quiz.estimatedTime}
                    </span>
                  </div>

                  <Paragraph className="text-gray-600 mb-4 flex-grow">
                    {quiz.description || "Take this quiz to explore more about your relationship."}
                  </Paragraph>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center">
                      <BarChartOutlined className="text-indigo-600 mr-1" />
                      <span className="text-sm text-gray-600">
                        {quiz.questionCount} questions
                      </span>
                    </div>
                    <Button
                      type="primary"
                      className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-md hover:shadow-indigo-300/50"
                      onClick={() => navigate(`/home/quiz/${quiz.quizId}`)}
                    >
                      <span className="flex items-center">
                        <CheckCircleOutlined className="mr-1" /> Start
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