import React, { useState } from "react";
import { Table, Modal, Input, Button, Form, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface Category {
    id: number;
    name: string;
}

const AdminCategory: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([
        { id: 1, name: "Technology" },
        { id: 2, name: "Business" },
        { id: 3, name: "Health" },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
        form.setFieldsValue({ name: category.name });
    };

    const handleDeleteCategory = (id: number) => {
        setCategories(categories.filter((category) => category.id !== id));
        message.success("Category deleted successfully!");
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (editingCategory) {
                setCategories(
                    categories.map((category) =>
                        category.id === editingCategory.id ? { ...category, name: values.name } : category
                    )
                );
                message.success("Category updated successfully!");
            } else {
                const newCategory = { id: Date.now(), name: values.name };
                setCategories([...categories, newCategory]);
                message.success("New category added successfully!");
            }
            setIsModalOpen(false);
            form.resetFields();
        });
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: "15%" },
        { title: "Category Name", dataIndex: "name", key: "name" },
        {
            title: "Actions",
            key: "action",
            width: "25%",
            render: (_: unknown, record: Category) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this category?"
                        onConfirm={() => handleDeleteCategory(record.id)}
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
                <h2 className="text-2xl font-bold">Category Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                    Add Category
                </Button>
            </div>

            <Table dataSource={categories} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />

            <Modal
                title={editingCategory ? "Edit Category" : "Add Category"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={editingCategory ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Category Name" rules={[{ required: true, message: "Please enter a category name" }]}>
                        <Input placeholder="Enter category name..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategory;
