import React, { useState } from "react";
import { Table, Modal, Input, Button, Form, List, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

interface Category {
    id: number;
    name: string;
}

interface Quiz {
    id: number;
    categoryId: number;
    title: string;
    answers: string[]; // Array of answers
}

const categories: Category[] = [
    { id: 1, name: "Technology" },
    { id: 2, name: "Business" },
    { id: 3, name: "Health" },
];

const AdminQuiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([
        {
            id: 1,
            categoryId: 1,
            title: "Sample Quiz 1",
            answers: ["Answer 1", "Answer 2"],
        },
        {
            id: 2,
            categoryId: 2,
            title: "Sample Quiz 2",
            answers: ["Answer A", "Answer B"],
        },
    ]);
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [newAnswer, setNewAnswer] = useState<string>("");
    const [answerForm] = Form.useForm();

    // Open View Answers Modal
    const handleViewAnswers = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsAnswerModalOpen(true);
    };

    // Add Answer to Quiz
    const handleAddAnswer = () => {
        if (selectedQuiz && selectedQuiz.id !== undefined && newAnswer !== "") {
            const updatedQuizzes = quizzes.map((quiz) =>
                quiz.id === selectedQuiz.id
                    ? { ...quiz, answers: [...quiz.answers, newAnswer] }
                    : quiz
            );
            setQuizzes(updatedQuizzes);
            message.success("Answer added successfully!");
            setNewAnswer(""); // Clear the input after adding
        } else {
            message.error("Please select a quiz to add an answer.");
        }
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
            title: "Actions",
            key: "actions",
            width: "20%",
            render: (_: unknown, record: Quiz) => (
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => handleViewAnswers(record)}
                >
                    Add Answer
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Quiz Management</h2>

            <Table dataSource={quizzes} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />

            {/* View Answers Modal */}
            <Modal
                title="Quiz Answers"
                open={isAnswerModalOpen}
                onCancel={() => setIsAnswerModalOpen(false)}
                footer={null}
            >
                <h3 className="text-lg font-semibold">Answers</h3>
                <List
                    dataSource={selectedQuiz?.answers || []}
                    renderItem={(answer) => ( // Removed 'index' as it's not used
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setNewAnswer(answer); // Set the answer for editing
                                    }}
                                    icon={<EditOutlined />}
                                >
                                    Edit
                                </Button>,
                            ]}
                        >
                            {answer}
                        </List.Item>
                    )}
                />
                <Form form={answerForm} layout="vertical" className="mt-4">
                    <Form.Item name="answer" label="Add or Edit Answer" rules={[{ required: true, message: "Enter an answer" }]}>
                        <Input.TextArea
                            placeholder="Enter answer..."
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                        />
                    </Form.Item>
                    <Button type="primary" onClick={handleAddAnswer}>
                        {selectedQuiz?.answers.includes(newAnswer) ? "Update Answer" : "Add Answer"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminQuiz;
