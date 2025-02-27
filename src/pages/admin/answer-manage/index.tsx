import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Button, List, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Category {
    categoryId: string;
    name: string;
}

interface Quiz {
    quizId: string;
    categoryId: string;
    name: string;
    description?: string;
    status: number;
}

interface Question {
    questionId: string;
    quizId: string;
    questionContent: string;
    questionStatus: number;
}

interface Answer {
    answerId: string;
    questionId: string;
    answerContent: string;
    score: number;
}

const AdminQuiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [addingAnswerForQuestion, setAddingAnswerForQuestion] = useState<string | null>(null);
    const [newAnswerContent, setNewAnswerContent] = useState<string>("");

    // Fetch danh sách quiz
    const fetchQuizzes = async () => {
        try {
            const response = await axios.get<Quiz[]>(`${API_BASE_URL}/Quiz/Get_All_Quiz`);
            console.log("Quizzes from API:", response.data);
            setQuizzes(response.data.filter((quiz) => quiz.quizId && typeof quiz.quizId === "string"));
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            message.error("Failed to load quizzes!");
        }
    };

    // Fetch danh sách category
    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category[]>(`${API_BASE_URL}/Category/Get_All_Categories`);
            console.log("Categories from API:", response.data);
            setCategories(
                response.data.filter((cat) => cat.categoryId && typeof cat.categoryId === "string")
            );
        } catch (error) {
            console.error("Error fetching categories:", error);
            message.error("Failed to load categories!");
        }
    };

    // Fetch danh sách câu hỏi
    const fetchQuestions = async () => {
        try {
            const response = await axios.get<Question[]>(`${API_BASE_URL}/Question/Get_All_Question`);
            console.log("Questions from API:", response.data);
            setQuestions(response.data.filter((q) => q.questionId && typeof q.questionId === "string"));
        } catch (error) {
            console.error("Error fetching questions:", error);
            message.error("Failed to load questions!");
        }
    };

    // Fetch danh sách câu trả lời
    const fetchAnswers = async () => {
        try {
            const response = await axios.get<Answer[]>(`${API_BASE_URL}/Answer/Get_All_Answer`);
            console.log("Answers from API:", response.data);
            setAnswers(response.data.filter((a) => a.answerId && typeof a.answerId === "string"));
        } catch (error) {
            console.error("Error fetching answers:", error);
            message.error("Failed to load answers!");
        }
    };

    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
        fetchQuestions();
        fetchAnswers();
    }, []);

    // Mở modal để xem câu hỏi và câu trả lời
    const handleViewAnswers = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setEditingAnswer(null);
        setEditContent("");
        setAddingAnswerForQuestion(null);
        setNewAnswerContent("");
        setIsAnswerModalOpen(true);
    };

    // Bật chế độ thêm câu trả lời cho câu hỏi cụ thể
    const handleStartAddingAnswer = (questionId: string) => {
        setAddingAnswerForQuestion(questionId);
        setNewAnswerContent("");
    };

    // Thêm câu trả lời mới
    const handleAddAnswer = async (questionId: string) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }
            if (!newAnswerContent) {
                message.error("Please enter answer content!");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                questionId: questionId,
                answerContent: newAnswerContent,
                score: 0, // Giá trị mặc định
            };

            const response = await axios.post(`${API_BASE_URL}/Answer/Create_Answer`, payload, { headers });
            console.log("Create Answer Response:", response.data);
            message.success("Answer added successfully!");
            setNewAnswerContent("");
            setAddingAnswerForQuestion(null); // Ẩn form sau khi thêm
            fetchAnswers(); // Cập nhật danh sách câu trả lời
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error details:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to add answer!");
        }
    };

    // Cập nhật câu trả lời
    const handleUpdateAnswer = async (answer: Answer) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                answerId: answer.answerId,
                questionId: answer.questionId,
                answerContent: editContent || answer.answerContent,
                score: answer.score || 0,
            };

            const response = await axios.post(`${API_BASE_URL}/Answer/Update_Answer`, payload, { headers });
            console.log("Update Answer Response:", response.data);
            message.success("Answer updated successfully!");
            setEditingAnswer(null);
            setEditContent("");
            fetchAnswers(); // Cập nhật danh sách câu trả lời
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error details:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to update answer!");
        }
    };

    // Chọn câu trả lời để chỉnh sửa
    const handleEditAnswer = (answer: Answer) => {
        setEditingAnswer(answer);
        setEditContent(answer.answerContent);
    };

    // Cột bảng quiz (không có ID)
    const columns = [
        { title: "Quiz Title", dataIndex: "name", key: "name" },
        {
            title: "Category",
            key: "category",
            render: (_: unknown, record: Quiz) =>
                categories.find((cat) => cat.categoryId === record.categoryId)?.name || "Unknown",
        },
        {
            title: "Actions",
            key: "actions",
            width: "20%",
            render: (_: unknown, record: Quiz) => (
                <Button icon={<PlusOutlined />} onClick={() => handleViewAnswers(record)}>
                    View Answers
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Answer Management</h2>

            <Table dataSource={quizzes} columns={columns} rowKey="quizId" pagination={{ pageSize: 5 }} />

            {/* Modal xem và chỉnh sửa câu trả lời */}
            <Modal
                title={`Answers for ${selectedQuiz?.name}`}
                open={isAnswerModalOpen}
                onCancel={() => {
                    setIsAnswerModalOpen(false);
                    setEditingAnswer(null);
                    setEditContent("");
                    setAddingAnswerForQuestion(null);
                    setNewAnswerContent("");
                }}
                footer={null}
                width={800}
            >
                <List
                    dataSource={questions.filter((q) => q.quizId === selectedQuiz?.quizId)}
                    renderItem={(question) => {
                        const questionAnswers = answers.filter((a) => a.questionId === question.questionId).slice(0, 4);
                        const canAddAnswer = questionAnswers.length < 4;

                        return (
                            <List.Item>
                                <div style={{ width: "100%" }}>
                                    <strong>{question.questionContent}</strong>
                                    <List
                                        dataSource={questionAnswers}
                                        renderItem={(answer) => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="link"
                                                        onClick={() => handleEditAnswer(answer)}
                                                        icon={<EditOutlined />}
                                                    >
                                                        Edit
                                                    </Button>,
                                                ]}
                                            >
                                                {editingAnswer?.answerId === answer.answerId ? (
                                                    <Input.TextArea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        onPressEnter={() => handleUpdateAnswer(answer)}
                                                        onBlur={() => handleUpdateAnswer(answer)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    answer.answerContent
                                                )}
                                            </List.Item>
                                        )}
                                    />
                                    {canAddAnswer && (
                                        <div style={{ marginTop: "10px" }}>
                                            {addingAnswerForQuestion === question.questionId ? (
                                                <>
                                                    <Input.TextArea
                                                        placeholder="Enter new answer..."
                                                        value={newAnswerContent}
                                                        onChange={(e) => setNewAnswerContent(e.target.value)}
                                                        style={{ marginBottom: "10px" }}
                                                    />
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleAddAnswer(question.questionId)}
                                                        disabled={!newAnswerContent}
                                                        style={{ marginRight: "10px" }}
                                                    >
                                                        Add Answer
                                                    </Button>
                                                    <Button
                                                        onClick={() => setAddingAnswerForQuestion(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    type="dashed"
                                                    onClick={() => handleStartAddingAnswer(question.questionId)}
                                                >
                                                    Add Answer
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Modal>
        </div>
    );
};

export default AdminQuiz;