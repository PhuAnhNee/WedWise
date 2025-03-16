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
    quiz?: Quiz | null;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    createdUser?: string;
    updatedUser?: string;
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
        Accept: "*/*",
    });

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Quiz[]>(`${API_BASE_URL}/Quiz/Get_All_Quiz`, {
                headers: getHeaders(),
                timeout: 10000
            });
            setQuizzes(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            message.error(err.response?.data?.message || "Failed to load quizzes!");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswers = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Answer[]>(`${API_BASE_URL}/Answer/Get_All_Answer`, {
                headers: getHeaders(),
                timeout: 10000
            });
            setAnswers(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            message.error(err.response?.data?.message || "Failed to load answers!");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizResults = async () => {
        setLoading(true);
        try {
            const response = await axios.get<QuizResult[]>(
                `${API_BASE_URL}/Controller/Get_All_Quiz_Result`,
                {
                    headers: getHeaders(),
                    timeout: 10000
                }
            );
            if (!Array.isArray(response.data)) {
                throw new Error("Invalid response format");
            }
            setQuizResults(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Fetch quiz results error:", err);
            message.error(err.response?.data?.message || "Failed to load quiz results!");
        } finally {
            setLoading(false);
        }
    };

    const calculateQuizResult = (quizId: string) => {
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
        fetchQuizResults();
    }, []);

    const handleAddResult = (quizId?: string) => {
        if (quizzes.length === 0) {
            message.error("Quizzes not loaded yet. Please try again!");
            return;
        }

        setSelectedResult(null);
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

        setIsModalOpen(true);
    };

    const handleEditResult = (result: QuizResult) => {
        setSelectedResult(result);
        form.setFieldsValue({
            quizId: result.quizId,
            title: result.title,
            score: result.score,
            level: result.level,
            description: result.description
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            console.log("Form values:", JSON.stringify(values, null, 2)); // Debug form values

            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const payload = [{
                quizId: values.quizId,
                score: Number(values.score),
                level: Number(values.level),
                title: values.title,
                description: values.description || ""
            }];

            console.log("Submitting payload:", JSON.stringify(payload, null, 2));

            const response = await axios.post(
                `${API_BASE_URL}/Controller/Create_Quiz_Result`,
                payload,
                { headers: getHeaders() }
            );

            console.log("Response:", response.data);

            message.success("Result created successfully!");
            await fetchQuizResults();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error("Full error:", error); // Log the entire error object
            if (axios.isAxiosError(error)) {
                const err = error as AxiosError<{ message?: string; errors?: string }>;
                console.error("Error response:", JSON.stringify(err.response?.data, null, 2));
                message.error(err.response?.data?.message || "Failed to create quiz result!");
                if (err.response?.status === 401) {
                    message.error("Session expired, please log in again.");
                }
            } else {
                message.error("An unexpected error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchQuizzes();
        fetchAnswers();
        fetchQuizResults();
    };

    const columns = [
        {
            title: "Quiz",
            key: "quiz",
            render: (_: unknown, record: QuizResult) =>
                record.quiz?.name ||
                quizzes.find((q) => q.quizId === record.quizId)?.name ||
                "Unknown",
        },
        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Score",
            dataIndex: "score",
            key: "score",
            sorter: (a: QuizResult, b: QuizResult) => a.score - b.score
        },
        {
            title: "Level",
            dataIndex: "level",
            key: "level",
            sorter: (a: QuizResult, b: QuizResult) => a.level - b.level
        },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: QuizResult) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditResult(record)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quiz Result Management</h2>
                <div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddResult()}
                        className="mr-2"
                    >
                        Add Result
                    </Button>
                    <Button onClick={handleRefresh}>
                        Refresh
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    dataSource={quizResults}
                    columns={columns}
                    rowKey="quizResultId"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20']
                    }}
                    scroll={{ x: 1000 }}
                />
            )}

            <Modal
                title={selectedResult ? "Edit Quiz Result" : "New Quiz Result"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedResult ? "Update" : "Create"}
                confirmLoading={loading}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="quizId"
                        label="Quiz"
                        rules={[{ required: true, message: "Please select a quiz" }]}
                    >
                        <Select
                            placeholder="Select quiz"
                            disabled={!!selectedResult}
                            showSearch
                            optionFilterProp="children"
                        >
                            {quizzes.map(quiz => (
                                <Select.Option key={quiz.quizId} value={quiz.quizId}>
                                    {quiz.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[
                            { required: true, message: "Please enter a title" },
                            { type: "string", min: 1, message: "Title must be at least 1 character" },
                            { type: "string", max: 100, message: "Title cannot exceed 100 characters" }
                        ]}
                    >
                        <Input placeholder="Result title" />
                    </Form.Item>

                    <Form.Item
                        name="score"
                        label="Score"
                        rules={[
                            { required: true, message: "Please enter a score" },
                            { type: "number", min: 0, max: 100, message: "Score must be between 0 and 100" }
                        ]}
                        normalize={(value) => (value ? Number(value) : value)} // Ensure number type
                    >
                        <Input type="number" min={0} max={100} step={1} />
                    </Form.Item>

                    <Form.Item
                        name="level"
                        label="Level"
                        rules={[
                            { required: true, message: "Please enter a level" },
                            { type: "number", min: 0, max: 4, message: "Level must be between 0 and 4" }
                        ]}
                        normalize={(value) => (value ? Number(value) : value)} // Ensure number type
                    >
                        <Input type="number" min={0} max={4} step={1} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { required: true, message: "Please enter a description" },
                            { type: "string", min: 1, message: "Description must be at least 1 character" },
                            { type: "string", max: 500, message: "Description cannot exceed 500 characters" }
                        ]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter result description" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuizResultManager;