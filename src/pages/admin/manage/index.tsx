import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Button, Form, message } from "antd";
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
        } catch (error) {
            console.error("Error submitting category:", error);
            message.error("Failed to save category!");
        }
    };

    const columns = [
        {
            title: "Category Name",
            dataIndex: "name",
            key: "name",
            render: (text: string) => <span className="font-medium text-gray-800">{text}</span>,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text?: string) => <span className="text-gray-600">{text || "No description"}</span>,
        },
        {
            title: "Actions",
            key: "action",
            width: "20%",
            render: (_: unknown, record: Category) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(record)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Category Management</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddCategory}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    Add Category
                </Button>
            </div>

            <Table
                dataSource={categories}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="shadow-md rounded-lg overflow-hidden"
                bordered
                rowClassName="hover:bg-gray-100"
            />

            <Modal
                title={
                    <span className="text-xl font-semibold text-gray-800">
                        {editingCategory ? "Edit Category" : "Add Category"}
                    </span>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={editingCategory ? "Update" : "Add"}
                okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600 text-white" }}
                cancelButtonProps={{ className: "border-gray-300 text-gray-700" }}
                width={500}
                centered
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label={<span className="font-medium text-gray-700">Category Name</span>}
                        rules={[{ required: true, message: "Please enter a category name" }]}
                    >
                        <Input
                            placeholder="Enter category name..."
                            className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label={<span className="font-medium text-gray-700">Description</span>}
                    >
                        <Input.TextArea
                            placeholder="Enter category description..."
                            rows={4}
                            className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategory;