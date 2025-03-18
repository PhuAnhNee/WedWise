import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Button, Form, Select, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz";

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

const AdminQuiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [form] = Form.useForm();

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get<Quiz[]>(`${API_BASE_URL}/Get_All_Quiz`);
            console.log("Quizzes from API:", response.data);
            const validQuizzes = response.data.filter((quiz) => quiz.quizId && typeof quiz.quizId === "string");
            setQuizzes(validQuizzes);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            message.error("Failed to load quizzes!");
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category[]>(
                "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Category/Get_All_Categories"
            );
            const rawData = response.data;
            console.log("Raw Categories from API (Full):", JSON.stringify(rawData, null, 2));

            const validCategories = rawData
                .filter((cat) => cat.categoryId && typeof cat.categoryId === "string" && /^[0-9a-fA-F-]{36}$/.test(cat.categoryId))
                .map((cat) => ({
                    categoryId: cat.categoryId,
                    name: cat.name || "Unnamed Category",
                }));

            if (validCategories.length === 0) {
                console.error("Không có category hợp lệ từ API!", rawData);
                message.error("Không tải được danh sách category!");
            } else {
                setCategories(validCategories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            message.error("Lỗi khi tải danh sách category!");
        }
    };

    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
    }, []);

    const handleAddQuiz = () => {
        if (categories.length === 0) {
            message.error("Danh sách category chưa tải. Vui lòng thử lại!");
            fetchCategories();
            return;
        }
        setSelectedQuiz(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleEditQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsModalOpen(true);
        form.setFieldsValue({ name: quiz.name, description: quiz.description });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log("Form Values:", values);
            const accessToken = localStorage.getItem("accessToken");
            console.log("Access Token:", accessToken);
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                categoryId: selectedQuiz ? selectedQuiz.categoryId : values.category,
                name: values.name,
                description: values.description || "",
            };
            console.log("Payload gửi đi:", payload);

            if (selectedQuiz) {
                const updatePayload = { quizId: selectedQuiz.quizId, ...payload, status: selectedQuiz.status };
                console.log("Update Payload:", updatePayload);
                const response = await axios.post(`${API_BASE_URL}/Update_Quiz`, updatePayload, { headers });
                console.log("Update Response:", response.data);
                message.success("Quiz updated successfully!");
            } else {
                console.log("Create Payload:", payload);
                const response = await axios.post(`${API_BASE_URL}/Create_Quiz`, payload, { headers });
                console.log("Create Response:", response.data);
                message.success("New quiz added successfully!");
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchQuizzes();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error details:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Vui lòng kiểm tra lại thông tin!");
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }
            setQuizzes(quizzes.filter((quiz) => quiz.quizId !== quizId));
            message.success("Quiz deleted successfully!");
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error deleting quiz:", err.response?.data || err.message);
        }
    };

    const columns = [
        { title: "Quiz Name", dataIndex: "name", key: "name" },
        {
            title: "Category",
            key: "category",
            render: (_: unknown, record: Quiz) =>
                categories.find((cat) => cat.categoryId === record.categoryId)?.name || "Unknown",
        },
        {
            title: "Actions",
            key: "actions",
            width: "25%",
            render: (_: unknown, record: Quiz) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} onClick={() => handleEditQuiz(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this quiz?"
                        onConfirm={() => handleDeleteQuiz(record.quizId)}
                        okText="Yes"
                        cancelText="No"
                    >
                        {/* <Button icon={<DeleteOutlined />} danger>
                            Delete
                        </Button> */}
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quiz Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuiz}>
                    Add Quiz
                </Button>
            </div>

            <Table dataSource={quizzes} columns={columns} rowKey="quizId" pagination={{ pageSize: 5 }} />

            <Modal
                title={selectedQuiz ? "Edit Quiz" : "Add New Quiz"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedQuiz ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Quiz Name"
                        rules={[{ required: true, message: "Please enter quiz name" }]}
                    >
                        <Input placeholder="Enter quiz name..." />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input placeholder="Enter quiz description..." />
                    </Form.Item>
                    {!selectedQuiz && (
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: "Please select a category" }]}
                        >
                            <Select placeholder="Select category">
                                {categories.map((category) => (
                                    <Select.Option key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default AdminQuiz;