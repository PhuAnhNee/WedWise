import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, message, Select, Spin } from "antd";
import axios, { AxiosError } from "axios";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Quiz {
    quizId: string;
    name: string;
}

interface Answer {
    answerId: string;
    quizId: string;
    score: number;
}

interface QuizResult {
    quizResultId?: string;
    quizId: string;
    score: number;
    level: number;
    title: string;
    description: string;
}

const QuizResultManager: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
    const [form] = Form.useForm();

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
    });

    // Fetch all quizzes with JWT authentication
    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }
            const headers = getHeaders();
            const response = await axios.get<Quiz[]>(`${API_BASE_URL}/Quiz/Get_All_Quiz`, { headers });
            setQuizzes(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching quizzes:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to load quizzes!");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all answers with JWT authentication
    const fetchAnswers = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }
            const headers = getHeaders();
            const response = await axios.get<Answer[]>(`${API_BASE_URL}/Answer/Get_All_Answer`, { headers });
            setAnswers(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching answers:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to load answers!");
        } finally {
            setLoading(false);
        }
    };

    // Fetch quiz results with JWT authentication (assuming an endpoint exists)
    const fetchQuizResults = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }
            const headers = getHeaders();
            const response = await axios.get<QuizResult[]>(`${API_BASE_URL}/QuizResult/Get_All_Quiz_Results`, { headers }); // Adjust endpoint as needed
            setQuizResults(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching quiz results:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to load quiz results!");
        } finally {
            setLoading(false);
        }
    };

    // Calculate quiz result based on answers (no authentication needed here)
    const calculateQuizResult = (quizId: string): { score: number; level: number; description: string } => {
        const quizAnswers = answers.filter((answer) => answer.quizId === quizId);
        const totalScore = quizAnswers.reduce((sum, answer) => sum + answer.score, 0);

        let level = 0;
        let description = "";
        if (totalScore >= 80) {
            level = 3;
            description = "Excellent! You've mastered this quiz.";
        } else if (totalScore >= 50) {
            level = 2;
            description = "Good job! You have a solid understanding.";
        } else if (totalScore >= 20) {
            level = 1;
            description = "Fair. You might need some review.";
        } else {
            level = 0;
            description = "Needs improvement. Keep practicing!";
        }

        return { score: totalScore, level, description };
    };

    useEffect(() => {
        fetchQuizzes();
        fetchAnswers();
        fetchQuizResults(); // Added to load initial quiz results
    }, []);

    const handleAddResult = (quizId?: string) => {
        if (quizzes.length === 0) {
            message.error("Quizzes not loaded yet. Please try again!");
            fetchQuizzes();
            return;
        }
        setSelectedResult(null);
        setIsModalOpen(true);
        form.resetFields();
        if (quizId) {
            const result = calculateQuizResult(quizId);
            form.setFieldsValue({
                quizId,
                score: result.score,
                level: result.level,
                description: result.description,
                title: `Result for ${quizzes.find((q) => q.quizId === quizId)?.name || "Quiz"}`,
            });
        }
    };

    const handleEditResult = (result: QuizResult) => {
        setSelectedResult(result);
        setIsModalOpen(true);
        form.setFieldsValue(result);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log("Form Values:", values);
            const accessToken: string | null = localStorage.getItem("accessToken"); // Changed 'let' to 'const'
            console.log("Access Token:", accessToken);
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            setLoading(true);
            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload: QuizResult = {
                quizResultId: selectedResult?.quizResultId,
                quizId: values.quizId,
                score: parseInt(values.score, 10), // Convert to number
                level: parseInt(values.level, 10), // Convert to number
                title: values.title,
                description: values.description,
            };
            console.log("Payload gửi đi:", payload);

            if (selectedResult) {
                const updatePayload = { ...payload };
                console.log("Update Payload:", updatePayload);
                const response = await axios.post(`${API_BASE_URL}/Controller/Update_Quiz_Result`, updatePayload, { headers });
                console.log("Update Response:", response.data);
                message.success("Quiz result updated successfully!");
                setQuizResults(quizResults.map((r) => (r.quizResultId === selectedResult.quizResultId ? payload : r)));
            } else {
                console.log("Create Payload:", payload);
                const response = await axios.post<QuizResult>(`${API_BASE_URL}/Controller/Create_Quiz_Result`, payload, {
                    headers,
                });
                console.log("Create Response:", response.data);
                message.success("Quiz result created successfully!");
                setQuizResults([...quizResults, response.data]);
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchQuizResults();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Full Error Response:", err.response); // Log full response
            if (err.response?.status === 401) {
                message.error("Session expired. Please log in again.");
                // Optionally: redirect to login page or refresh token
                // const newToken = await refreshToken();
                // Retry the request with newToken if implemented
            } else {
                message.error(err.response?.data?.message || "Vui lòng kiểm tra lại thông tin!");
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Quiz",
            key: "quiz",
            render: (_: unknown, record: QuizResult) => quizzes.find((q) => q.quizId === record.quizId)?.name || "Unknown",
        },
        { title: "Title", dataIndex: "title", key: "title" },
        { title: "Score", dataIndex: "score", key: "score" },
        { title: "Level", dataIndex: "level", key: "level" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: QuizResult) => (
                <Button icon={<EditOutlined />} onClick={() => handleEditResult(record)} loading={loading}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quiz Result Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddResult()} loading={loading}>
                    Add Result
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <Table dataSource={quizResults} columns={columns} rowKey="quizResultId" pagination={{ pageSize: 5 }} />
            )}

            <Modal
                title={selectedResult ? "Edit Quiz Result" : "Add New Quiz Result"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedResult ? "Update" : "Create"}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="quizId" label="Quiz" rules={[{ required: true, message: "Please select a quiz" }]}>
                        <Select placeholder="Select quiz" disabled={loading || selectedResult !== null}>
                            {quizzes.map((quiz) => (
                                <Select.Option key={quiz.quizId} value={quiz.quizId}>
                                    {quiz.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter a title" }]}>
                        <Input placeholder="Enter result title..." disabled={loading} />
                    </Form.Item>
                    <Form.Item name="score" label="Score" rules={[{ required: true, message: "Please enter a score" }]}>
                        <Input type="number" placeholder="Enter score..." disabled={loading} />
                    </Form.Item>
                    <Form.Item name="level" label="Level" rules={[{ required: true, message: "Please enter a level" }]}>
                        <Input type="number" placeholder="Enter level..." disabled={loading} />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: "Please enter a description" }]}
                    >
                        <Input placeholder="Enter description..." disabled={loading} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuizResultManager;