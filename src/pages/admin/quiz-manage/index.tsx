import React, { useState } from "react";
import { Table, Modal, Input, Button, Form, Select, message, Popconfirm, List } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface Category {
    id: number;
    name: string;
}

interface Quiz {
    id: number;
    categoryId: number;
    title: string;
    questions: string[];
}

const categories: Category[] = [
    { id: 1, name: "Technology" },
    { id: 2, name: "Business" },
    { id: 3, name: "Health" },
];

const AdminQuiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [form] = Form.useForm();
    const [questionForm] = Form.useForm();

    // Open Add Quiz Modal
    const handleAddQuiz = () => {
        setSelectedQuiz(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    // Save Quiz
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (selectedQuiz) {
                // Edit existing quiz
                setQuizzes(
                    quizzes.map((quiz) =>
                        quiz.id === selectedQuiz.id ? { ...quiz, title: values.title } : quiz
                    )
                );
                message.success("Quiz updated successfully!");
            } else {
                // Add new quiz
                const newQuiz: Quiz = {
                    id: Date.now(),
                    categoryId: values.category,
                    title: values.title,
                    questions: [],
                };
                setQuizzes([...quizzes, newQuiz]);
                message.success("New quiz added successfully!");
            }
            setIsModalOpen(false);
            form.resetFields();
        });
    };

    // Delete quiz
    const handleDeleteQuiz = (id: number) => {
        setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
        message.success("Quiz deleted successfully!");
    };

    // Open Edit Quiz Modal
    const handleEditQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsEditModalOpen(true);
        form.setFieldsValue({ title: quiz.title });
    };

    // // Open Add Question Modal
    // const handleAddQuestion = (quiz: Quiz) => {
    //     setSelectedQuiz(quiz);
    //     questionForm.resetFields();
    //     setIsEditModalOpen(true); // Reuse edit modal for adding questions
    // };

    // Save Question
    const handleSaveQuestion = () => {
        questionForm.validateFields().then((values) => {
            if (selectedQuiz) {
                const updatedQuizzes = quizzes.map((quiz) =>
                    quiz.id === selectedQuiz.id ? { ...quiz, questions: [...quiz.questions, values.question] } : quiz
                );
                setQuizzes(updatedQuizzes);
                message.success("Question added successfully!");
                questionForm.resetFields();
            }
        });
    };

    // Delete Question
    const handleDeleteQuestion = (quizId: number, questionIndex: number) => {
        const updatedQuizzes = quizzes.map((quiz) =>
            quiz.id === quizId ? { ...quiz, questions: quiz.questions.filter((_, index) => index !== questionIndex) } : quiz
        );
        setQuizzes(updatedQuizzes);
        message.success("Question deleted successfully!");
    };

    // Table columns
    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: "10%" },
        { title: "Quiz Title", dataIndex: "title", key: "title" },
        {
            title: "Category",
            key: "category",
            render: (_: unknown, record: Quiz) => categories.find((cat) => cat.id === record.categoryId)?.name || "Unknown",
        },
        {
            title: "Questions",
            key: "questions",
            render: (_: unknown, record: Quiz) => <span>{record.questions.length} questions</span>,
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
                    {/* <Button icon={<PlusOutlined />} onClick={() => handleAddQuestion(record)}>
                        Add Question
                    </Button> */}
                    <Popconfirm
                        title="Are you sure you want to delete this quiz?"
                        onConfirm={() => handleDeleteQuiz(record.id)}
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

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quiz Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuiz}>
                    Add Quiz
                </Button>
            </div>

            <Table dataSource={quizzes} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />

            {/* Add/Edit Quiz Modal */}
            <Modal
                title={selectedQuiz ? "Edit Quiz" : "Add New Quiz"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedQuiz ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Quiz Title" rules={[{ required: true, message: "Please enter quiz title" }]}>
                        <Input placeholder="Enter quiz title..." />
                    </Form.Item>
                    {!selectedQuiz && (
                        <Form.Item name="category" label="Category" rules={[{ required: true, message: "Please select a category" }]}>
                            <Select placeholder="Select category">
                                {categories.map((category) => (
                                    <Select.Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {/* Edit Quiz Modal (View & Edit Questions) */}
            <Modal
                title="Edit Quiz & Questions"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Quiz Title">
                        <Input />
                    </Form.Item>
                </Form>

                <h3 className="text-lg font-semibold">Questions</h3>
                <List
                    dataSource={selectedQuiz?.questions || []}
                    renderItem={(question, index) => (
                        <List.Item
                            actions={[
                                <Popconfirm
                                    title="Delete this question?"
                                    onConfirm={() => handleDeleteQuestion(selectedQuiz!.id, index)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button danger icon={<DeleteOutlined />} />
                                </Popconfirm>,
                            ]}
                        >
                            {question}
                        </List.Item>
                    )}
                />

                {/* Add New Question */}
                <Form form={questionForm} layout="vertical" className="mt-4">
                    <Form.Item name="question" label="Add Question" rules={[{ required: true, message: "Enter a question" }]}>
                        <Input.TextArea placeholder="Enter question..." />
                    </Form.Item>
                    <Button type="primary" onClick={handleSaveQuestion}>
                        Add Question
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminQuiz;
