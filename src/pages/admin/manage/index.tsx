import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Button, Form, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Category";

interface Category {
    id: string;
    name: string;
    description?: string;
    status: number;
}

const AdminCategory: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    // Fetch danh mục từ API
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

    // Xử lý thêm hoặc cập nhật danh mục
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const accessToken = localStorage.getItem("accessToken");
            console.log("Access Token:", accessToken);

            if (!accessToken) {
                message.error("Không tìm thấy accessToken. Vui lòng đăng nhập lại.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = { name: values.name, description: values.description || "" };
            console.log("Request Payload:", payload);

            let response;
            if (editingCategory) {
                // Cập nhật danh mục
                response = await axios.post(
                    `${API_BASE_URL}/Update_Category`,
                    { id: editingCategory.id, ...payload, status: editingCategory.status },
                    { headers }
                );
                console.log("Update Response:", response.data);
                message.success("Category updated successfully!");
            } else {
                // Thêm danh mục mới
                response = await axios.post(`${API_BASE_URL}/Create_Category`, payload, { headers });
                console.log("Create Response:", response.data);
                message.success("New category added successfully!");
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchCategories();
        } catch {
            //   console.error("Error submitting category:", error.response?.data || error.message);
            //   message.error(error.response?.data?.message || "Failed to save category!");
        }
    };

    // Cập nhật trạng thái Active/Inactive
    const handleToggleCategoryStatus = async (id: string, newStatus: number) => {
        try {
            const categoryToUpdate = categories.find((category) => category.id === id);
            if (!categoryToUpdate) {
                message.error("Category not found!");
                return;
            }

            const accessToken = localStorage.getItem("accessToken");
            console.log("Access Token for Toggle:", accessToken);

            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                id,
                name: categoryToUpdate.name,
                description: categoryToUpdate.description,
                status: newStatus,
            };
            console.log("Toggle Payload:", payload);

            const response = await axios.post(`${API_BASE_URL}/Update_Category`, payload, { headers });
            console.log("Toggle Response:", response.data);

            message.success(newStatus === 1 ? "Category activated successfully!" : "Category deactivated successfully!");
            fetchCategories();
        } catch {
            //   console.error("Error updating category status:", error.response?.data || error.message);
            //   message.error(error.response?.data?.message || "Failed to update category status!");
        }
    };

    const columns = [
        { title: "Category Name", dataIndex: "name", key: "name" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Actions",
            key: "action",
            width: "30%",
            render: (_: unknown, record: Category) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
                        Edit
                    </Button>

                    {/* Nút Activate */}
                    <Popconfirm
                        title="Are you sure you want to activate this category?"
                        onConfirm={() => handleToggleCategoryStatus(record.id, 1)}
                        okText="Yes"
                        cancelText="No"
                        disabled={record.status === 1}
                    >
                        <Button type="primary" disabled={record.status === 1}>
                            Activate
                        </Button>
                    </Popconfirm>

                    {/* Nút Deactivate */}
                    <Popconfirm
                        title="Are you sure you want to deactivate this category?"
                        onConfirm={() => handleToggleCategoryStatus(record.id, 0)}
                        okText="Yes"
                        cancelText="No"
                        disabled={record.status === 0}
                    >
                        <Button danger disabled={record.status === 0}>
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

            <Table dataSource={categories} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />

            <Modal
                title={editingCategory ? "Edit Category" : "Add Category"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={editingCategory ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: "Please enter a category name" }]}
                    >
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