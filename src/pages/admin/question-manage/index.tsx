import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Button, Form, List, message } from "antd";
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
    answerContent: string;
    score: number;
}

const AdminQuiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([{ answerContent: "", score: 0 }]);
    const [form] = Form.useForm();

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

    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
        fetchQuestions();
    }, []);

    // Mở modal để xem/thêm câu hỏi
    const handleViewAnswers = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setEditingQuestion(null);
        setAnswers([{ answerContent: "", score: 0 }]); // Reset answers khi mở modal
        form.resetFields();
        setIsAnswerModalOpen(true);
    };

    // Thêm hoặc cập nhật câu hỏi
    const handleAddOrUpdateQuestion = async () => {
        try {
            const values = await form.validateFields();
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

            if (editingQuestion) {
                // Cập nhật câu hỏi
                const payload = {
                    questionId: editingQuestion.questionId,
                    quizId: selectedQuiz!.quizId,
                    questionContent: values.questionContent,
                    questionStatus: editingQuestion.questionStatus || 1,
                };
                const response = await axios.post(`${API_BASE_URL}/Question/Update_Question`, payload, { headers });
                console.log("Update Question Response:", response.data);
                message.success("Question updated successfully!");
            } else {
                // Thêm câu hỏi mới
                const payload = {
                    quizId: selectedQuiz!.quizId,
                    questionContent: values.questionContent,
                    answers: answers.filter((ans) => ans.answerContent.trim() !== ""), // Chỉ gửi các câu trả lời không rỗng
                };
                const response = await axios.post(`${API_BASE_URL}/Question/Create_Question`, payload, { headers });
                console.log("Create Question Response:", response.data);
                message.success("Question added successfully!");
            }

            form.resetFields();
            setAnswers([{ answerContent: "", score: 0 }]); // Reset answers sau khi thêm/cập nhật
            setEditingQuestion(null);
            fetchQuestions(); // Cập nhật danh sách câu hỏi
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error details:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to add/update question!");
        }
    };

    // Chọn câu hỏi để chỉnh sửa
    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        form.setFieldsValue({ questionContent: question.questionContent });
    };

    // Thêm trường câu trả lời mới
    const addAnswerField = () => {
        setAnswers([...answers, { answerContent: "", score: 0 }]);
    };

    // Cập nhật nội dung hoặc điểm của câu trả lời
    const handleAnswerChange = (index: number, field: "answerContent" | "score", value: string | number) => {
        const newAnswers = [...answers];
        newAnswers[index][field] = value as never; // Type assertion để đơn giản hóa
        setAnswers(newAnswers);
    };

    // Cột bảng quiz
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
                    Add Question
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Question Management</h2>

            <Table dataSource={quizzes} columns={columns} rowKey="quizId" pagination={{ pageSize: 5 }} />

            {/* Modal xem/thêm/cập nhật câu hỏi */}
            <Modal
                title={editingQuestion ? "Edit Question" : "Quiz Questions"}
                open={isAnswerModalOpen}
                onCancel={() => {
                    setIsAnswerModalOpen(false);
                    setEditingQuestion(null);
                    setAnswers([{ answerContent: "", score: 0 }]);
                    form.resetFields();
                }}
                footer={null}
            >
                <h3 className="text-lg font-semibold">Questions for {selectedQuiz?.name}</h3>
                <List
                    dataSource={questions.filter((q) => q.quizId === selectedQuiz?.quizId)}
                    renderItem={(question) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() => handleEditQuestion(question)}
                                    icon={<EditOutlined />}
                                >
                                    Edit
                                </Button>,
                            ]}
                        >
                            {question.questionContent}
                        </List.Item>
                    )}
                />
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="questionContent"
                        label={editingQuestion ? "Edit Question" : "Add New Question"}
                        rules={[{ required: true, message: "Enter a question" }]}
                    >
                        <Input.TextArea placeholder="Enter question..." />
                    </Form.Item>

                    {/* Chỉ hiển thị phần nhập câu trả lời khi thêm câu hỏi mới */}
                    {!editingQuestion && (
                        <>
                            <h4 className="font-semibold mb-2">Answers</h4>
                            {answers.map((answer, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <Input
                                        placeholder="Answer content"
                                        value={answer.answerContent}
                                        onChange={(e) => handleAnswerChange(index, "answerContent", e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Score"
                                        value={answer.score}
                                        onChange={(e) => handleAnswerChange(index, "score", Number(e.target.value))}
                                    />
                                </div>
                            ))}
                            <Button type="dashed" onClick={addAnswerField} block className="mb-4">
                                Add Answer
                            </Button>
                        </>
                    )}

                    <Button type="primary" onClick={handleAddOrUpdateQuestion}>
                        {editingQuestion ? "Update Question" : "Add Question"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminQuiz;