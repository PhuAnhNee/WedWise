import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Table, Modal, Input, Button, Form, message, Popconfirm, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface QuizResult {
    quizResultId?: string; // Optional for create, required for update/delete
    quizId: string; // Used internally, not displayed
    score?: number; // Restricted to 25, 50, 75, 100
    level: number;
    title: string; // Selected from category names
    description: string;
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

const QuizResult: React.FC = () => {
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
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            message.error('Unauthorized: Please log in again.');
            throw new Error('No access token found');
        }
        return {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
        };
    };

    const fetchQuizResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get<QuizResult[]>(`${API_BASE_URL}/Get_All_Quiz_Result`, { headers: getHeaders() });
            const validQuizResults = response.data.filter((result) => result.quizResultId && typeof result.quizResultId === 'string');
            setQuizResults(validQuizResults);
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            message.error('Failed to load quiz results!');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get<Quiz[]>(`${QUIZ_API_URL}/Get_All_Quiz`, { headers: getHeaders() });
            const validQuizzes = response.data.filter((quiz) => quiz.quizId && typeof quiz.quizId === 'string');
            setQuizzes(validQuizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            message.error('Failed to load quizzes!');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category[]>(`${CATEGORY_API_URL}/Get_All_Categories`, { headers: getHeaders() });
            const validCategories = response.data.filter((cat) => cat.categoryId && typeof cat.categoryId === 'string');
            setCategories(validCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Failed to load categories!');
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
            quizId: quizResult.quizId, // Will match a quiz ID, displays name in Select
            score: quizResult.score,
            level: quizResult.level,
            title: quizResult.title, // Matches a category name
            description: quizResult.description,
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const headers = getHeaders();

            const payload: QuizResult = {
                quizId: values.quizId, // Selected quiz ID from dropdown
                score: values.score,
                level: values.level,
                title: values.title, // Selected category name
                description: values.description || '',
            };

            if (selectedQuizResult) {
                const updatePayload = {
                    quizResultId: selectedQuizResult.quizResultId,
                    ...payload,
                };
                const response = await axios.post(`${API_BASE_URL}/Update_Quiz_Result`, updatePayload, { headers });
                if (response.status === 200) {
                    message.success('Quiz result updated successfully!');
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/Create_Quiz_Result`, [payload], { headers }); // API expects an array
                if (response.status === 200 || response.status === 201) {
                    message.success('New quiz result added successfully!');
                }
            }

            setIsModalOpen(false);
            form.resetFields();
            await fetchQuizResults();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error('Error details:', err.response?.data || err.message);
            message.error(err.response?.data?.message || 'Please check your input!');
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
                { headers }
            );
            if (response.status === 200) {
                message.success('Quiz result deleted successfully!');
                setQuizResults(quizResults.filter((result) => result.quizResultId !== quizResultId));
            }
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error('Error deleting quiz result:', err.response?.data || err.message);
            message.error(err.response?.data?.message || 'Failed to delete quiz result!');
            await fetchQuizResults(); // Refresh in case of failure
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizResults();
        fetchQuizzes(); // Fetch quizzes on mount
        fetchCategories(); // Fetch categories on mount
    }, []);

    const columns = [
        { title: 'Quiz Name', key: 'quizName', render: (_: unknown, record: QuizResult) => quizzes.find(q => q.quizId === record.quizId)?.name || 'Unknown' },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Score', dataIndex: 'score', key: 'score' },
        { title: 'Level', dataIndex: 'level', key: 'level' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
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
                        <Select placeholder="Select a quiz">
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
                </Form>
            </Modal>
        </div>
    );
};

export default QuizResult;