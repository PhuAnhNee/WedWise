import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Table, Modal, Input, Button, Form, message, Popconfirm, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface QuizResult {
    quizResultId?: string;
    quizId: string;
    score?: number;
    level: number;
    title: string;
    description: string;
    status: number; // 0 = Active, 1 = Inactive
}

interface Quiz {
    quizId: string;
    name: string;
    categoryId?: string;
    description?: string;
    status?: number;
}

interface Category {
    categoryId: string;
    name: string;
    description: string;
    status: number;
}

const QuizResultComponent: React.FC = () => {
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuizResult, setSelectedQuizResult] = useState<QuizResult | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Controller';
    const QUIZ_API_URL = 'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Quiz';
    const CATEGORY_API_URL = 'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Category';

    const getHeaders = () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }
            return {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': '*/*',
            };
        } catch (error) {
            message.error('Authentication error: Please log in again');
            throw error;
        }
    };

    const fetchQuizResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get<QuizResult[]>(`${API_BASE_URL}/Get_All_Quiz_Result`, {
                headers: getHeaders(),
                timeout: 10000
            });
            const validQuizResults = response.data.filter((result) => result.quizResultId && typeof result.quizResultId === 'string');
            setQuizResults(validQuizResults);
            return validQuizResults;
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            message.error('Failed to load quiz results!');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get<Quiz[]>(`${QUIZ_API_URL}/Get_All_Quiz`, {
                headers: getHeaders(),
                timeout: 10000
            });
            const validQuizzes = response.data.filter((quiz) => quiz.quizId && typeof quiz.quizId === 'string');
            setQuizzes(validQuizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            message.error('Failed to load quizzes!');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category[]>(`${CATEGORY_API_URL}/Get_All_Categories`, {
                headers: getHeaders(),
                timeout: 10000
            });
            const validCategories = response.data.filter((cat) => cat.categoryId && typeof cat.categoryId === 'string');
            setCategories(validCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Failed to load categories!');
        }
    };

    const validatePayload = (data: QuizResult) => {
        if (!data.quizId || typeof data.quizId !== 'string') {
            throw new Error('Invalid quiz ID');
        }
        if (data.score && ![25, 50, 75, 100].includes(data.score)) {
            throw new Error('Invalid score value');
        }
        if (!data.title) {
            throw new Error('Title is required');
        }
        if (typeof data.level !== 'number') {
            throw new Error('Invalid level value');
        }
        if (typeof data.status !== 'number' || ![0, 1].includes(data.status)) {
            throw new Error('Invalid status value');
        }
    };

    const handleAddQuizResult = () => {
        if (quizzes.length === 0 || categories.length === 0) {
            message.error('Quiz or category list not loaded yet. Please wait or refresh!');
            fetchQuizzes();
            fetchCategories();
            return;
        }
        setSelectedQuizResult(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleEditQuizResult = (quizResult: QuizResult) => {
        setSelectedQuizResult(quizResult);
        setIsModalOpen(true);
        form.setFieldsValue({
            quizId: quizResult.quizId,
            score: quizResult.score,
            level: quizResult.level,
            title: quizResult.title,
            description: quizResult.description,
            status: quizResult.status
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const headers = getHeaders();

            const payload: QuizResult = {
                quizId: selectedQuizResult ? selectedQuizResult.quizId : values.quizId, // Keep original quizId when editing
                score: values.score,
                level: values.level,
                title: values.title,
                description: values.description || '',
                status: values.status || 0 // 0 = Active by default
            };

            validatePayload(payload);

            if (selectedQuizResult) {
                // Update case
                const updatePayload = {
                    quizResultId: selectedQuizResult.quizResultId,
                    ...payload
                };
                const response = await axios.post(
                    `${API_BASE_URL}/Update_Quiz_Result`,
                    updatePayload,
                    { headers, timeout: 10000 }
                );

                if (response.status >= 200 && response.status < 300) {
                    message.success('Quiz result updated successfully!');
                    const updatedResults = [
                        updatePayload,
                        ...quizResults.filter(result => result.quizResultId !== selectedQuizResult.quizResultId)
                    ];
                    setQuizResults(updatedResults);
                    await fetchQuizResults();
                } else {
                    throw new Error(`Unexpected status code: ${response.status}`);
                }
            } else {
                // Create case
                const response = await axios.post(
                    `${API_BASE_URL}/Create_Quiz_Result`,
                    [payload],
                    { headers, timeout: 10000 }
                );

                if (response.status >= 200 && response.status < 300) {
                    message.success('New quiz result added successfully!');
                    const newResult = {
                        ...payload,
                        quizResultId: response.data[0]?.quizResultId || Date.now().toString()
                    };
                    const updatedResults = [newResult, ...quizResults];
                    setQuizResults(updatedResults);
                    await fetchQuizResults();
                }
            }

            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            if (err.response) {
                const errorData = err.response.data;
                const errorMessage = errorData?.message ||
                    (errorData?.errors ? Object.values(errorData.errors)[0][0] :
                        'Failed to process quiz result');
                message.error(errorMessage);
            } else if (err.request) {
                message.error('Network error: Unable to reach the server');
            } else {
                message.error(error instanceof Error ? error.message : 'An unexpected error occurred');
            }
            console.error('Error details:', err.response?.data || err.message);
            await fetchQuizResults();
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuizResult = async (quizResultId: string) => {
        try {
            setLoading(true);
            const headers = getHeaders();
            const response = await axios.post(
                `${API_BASE_URL}/Delete_Quiz_Result?id=${quizResultId}`,
                null,
                { headers, timeout: 10000 }
            );
            if (response.status >= 200 && response.status < 300) {
                message.success('Quiz result deleted successfully!');
                setQuizResults(quizResults.filter((result) => result.quizResultId !== quizResultId));
            }
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error('Error deleting quiz result:', err.response?.data || err.message);
            message.error(err.response?.data?.message || 'Failed to delete quiz result!');
            await fetchQuizResults();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizResults();
        fetchQuizzes();
        fetchCategories();
    }, []);

    const columns = [
        {
            title: 'Quiz Name',
            key: 'quizName',
            render: (_: unknown, record: QuizResult) => quizzes.find(q => q.quizId === record.quizId)?.name || 'Unknown'
        },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Score', dataIndex: 'score', key: 'score' },
        { title: 'Level', dataIndex: 'level', key: 'level' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => status === 0 ? 'Active' : 'Inactive' // 0 = Active, 1 = Inactive
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '25%',
            render: (_: unknown, record: QuizResult) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} onClick={() => handleEditQuizResult(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this quiz result?"
                        onConfirm={() => handleDeleteQuizResult(record.quizResultId!)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const scoreOptions = [25, 50, 75, 100];

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quiz Result Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuizResult}>
                    Add Quiz Result
                </Button>
            </div>

            <Table
                dataSource={quizResults}
                columns={columns}
                rowKey="quizResultId"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={selectedQuizResult ? 'Edit Quiz Result' : 'Add New Quiz Result'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedQuizResult ? 'Update' : 'Add'}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="quizId"
                        label="Quiz Name"
                        rules={[{ required: true, message: 'Please select a quiz' }]}
                    >
                        <Select
                            placeholder="Select a quiz"
                            disabled={!!selectedQuizResult} // Disable when editing
                        >
                            {quizzes.map((quiz) => (
                                <Select.Option key={quiz.quizId} value={quiz.quizId}>
                                    {quiz.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="score"
                        label="Score"
                        rules={[{ required: true, message: 'Please select a score' }]}
                    >
                        <Select placeholder="Select score">
                            {scoreOptions.map((score) => (
                                <Select.Option key={score} value={score}>
                                    {score}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="level"
                        label="Level"
                        rules={[{ required: true, message: 'Please enter level' }]}
                    >
                        <InputNumber min={0} placeholder="Enter level..." style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please select a category as title' }]}
                    >
                        <Select placeholder="Select category as title">
                            {categories.map((category) => (
                                <Select.Option key={category.categoryId} value={category.name}>
                                    {category.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input placeholder="Enter description..." />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select placeholder="Select status">
                            <Select.Option value={0}>Active</Select.Option>    {/* 0 = Active */}
                            <Select.Option value={1}>Inactive</Select.Option>  {/* 1 = Inactive */}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuizResultComponent;