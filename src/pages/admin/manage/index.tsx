import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Button, Form, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Category";

interface Category {
    id: number;
    name: string;
    description?: string; // ✅ Thêm description vào giao diện
}

const AdminCategory: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    // 🟢 Lấy danh sách danh mục từ API
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Get_All_Categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            message.error("Failed to load categories!");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
        form.setFieldsValue({ name: category.name, description: category.description });
    };

    // 🟢 Thêm hoặc cập nhật danh mục
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const accessToken = localStorage.getItem("accessToken"); // Lấy token từ localStorage

            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };

            if (editingCategory) {
                // 🟢 Cập nhật danh mục
                await axios.post(
                    `${API_BASE_URL}/Update_Category`,
                    { id: editingCategory.id, name: values.name, description: values.description || "" },
                    { headers }
                );

                message.success("Category updated successfully!");
            } else {
                // 🟢 Tạo danh mục mới (✅ Thêm `description`)
                await axios.post(
                    `${API_BASE_URL}/Create_Category`,
                    { name: values.name, description: values.description || "" }, // ✅ Đảm bảo description không bị undefined
                    { headers }
                );

                message.success("New category added successfully!");
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchCategories(); // Load lại danh sách danh mục từ API
        } catch (error) {
            console.error("Error submitting category:", error);
            message.error("Failed to save category!");
        }
    };

    // 🟢 Xoá danh mục (cập nhật trạng thái "inactive")
    const handleDeleteCategory = async (id: number) => {
        try {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { "Authorization": `Bearer ${accessToken}` };

            const categoryToUpdate = categories.find((category) => category.id === id);
            if (!categoryToUpdate) {
                message.error("Category not found!");
                return;
            }

            await axios.post(
                `${API_BASE_URL}/Update_Category`,
                { id: categoryToUpdate.id, name: categoryToUpdate.name, description: categoryToUpdate.description, status: "inactive" },
                { headers }
            );

            message.success("Category deactivated successfully!");
            fetchCategories();
        } catch (error) {
            console.error("Error deactivating category:", error);
            message.error("Failed to deactivate category!");
        }
    };

    const columns = [
        { title: "Category Name", dataIndex: "name", key: "name" },
        { title: "Description", dataIndex: "description", key: "description" }, // ✅ Hiển thị mô tả

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
                        title="Are you sure you want to deactivate this category?"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Deactivate
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
                    <Form.Item name="description" label="Description">
                        <Input placeholder="Enter category description..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategory;
