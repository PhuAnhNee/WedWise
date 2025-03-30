import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Table, Modal, Input, Button, Form, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

interface Category {
    categoryId: string;
    name: string;
    description: string;
    status: number;
    createdAt?: string;
    updatedAt?: string;
}

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Category';

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

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Category[]>(`${API_BASE_URL}/Get_All_Categories`, { headers: getHeaders() });
            const validCategories = response.data.filter((cat) => cat.categoryId && typeof cat.categoryId === 'string');
            setCategories(validCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Failed to load categories!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
        form.setFieldsValue({ name: category.name, description: category.description });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const headers = getHeaders();
            const payload = {
                name: values.name,
                description: values.description || '',
            };

            if (selectedCategory) {
                const updatePayload = {
                    categoryId: selectedCategory.categoryId,
                    ...payload,
                    status: selectedCategory.status
                };
                const response = await axios.post(`${API_BASE_URL}/Update_Category`, updatePayload, { headers });
                if (response.status === 200) {
                    message.success('Category updated successfully!');
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/Create_Category`, payload, { headers });
                if (response.status === 200 || response.status === 201) {
                    message.success('New category added successfully!');
                }
            }

            setIsModalOpen(false);
            form.resetFields();
            await fetchCategories();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error('Error details:', err.response?.data || err.message);
            message.error(err.response?.data?.message || 'Please check your input!');
        } finally {
            setLoading(false);
        }
    };

    //   const handleDeleteCategory = async (categoryId: string) => {
    //     try {
    //       const headers = getHeaders();
    //       // Note: Your API doesn't seem to have a DELETE endpoint based on previous info.
    //       // Uncomment and adjust the URL/method if you have a delete endpoint:
    //       // await axios.delete(`${API_BASE_URL}/Delete_Category/${categoryId}`, { headers });
    //       setCategories(categories.filter((cat) => cat.categoryId !== categoryId));
    //       message.success('Category deleted successfully!');
    //     } catch (error) {
    //       const err = error as AxiosError<{ message?: string }>;
    //       console.error('Error deleting category:', err.response?.data || err.message);
    //       message.error(err.response?.data?.message || 'Failed to delete category!');
    //       await fetchCategories(); // Refresh in case of failure to keep UI in sync
    //     }
    //   };

    useEffect(() => {
        fetchCategories();
    }, []);

    const columns = [
        { title: 'Category Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Actions',
            key: 'actions',
            width: '25%',
            render: (_: unknown, record: Category) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
                        Edit
                    </Button>
                    {/* Uncomment this if you have a DELETE endpoint */}
                    {/* <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteCategory(record.categoryId)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm> */}
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

            <Table
                dataSource={categories}
                columns={columns}
                rowKey="categoryId"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={selectedCategory ? 'Edit Category' : 'Add New Category'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedCategory ? 'Update' : 'Add'}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
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

export default CategoryManagement;