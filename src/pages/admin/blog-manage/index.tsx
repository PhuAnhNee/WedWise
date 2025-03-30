import React, { useEffect, useState } from "react";
import {
    Table, Button, message, Modal, Form, Input, Pagination, Switch,
    Card, Typography, Space, Tooltip, Spin, Empty, Divider
} from "antd";
import {
    EditOutlined, PlusOutlined, EyeOutlined,
    LinkOutlined, CheckCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Blog {
    id: string;
    title: string;
    content: string;
    body: string;
    status: number; // 0 = Active, 1 = Inactive
    picture: string;
}

const BlogManage: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const pageSize = 5;

    // Fetch all blogs
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Blog[]>(`${API_BASE_URL}/Blog/Get_All_Blog`);
            setBlogs(
                response.data.map((blog) => ({
                    ...blog,
                    key: blog.id,
                }))
            );
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching blogs:", err.response?.data || err.message);
            message.error("Failed to load blogs!");
        } finally {
            setLoading(false);
        }
    };

    // Fetch blog by ID (for update pre-fill)
    const fetchBlogById = async (id: string) => {
        try {
            const response = await axios.get<Blog>(`${API_BASE_URL}/Blog/Get_Blog_By_Id?id=${id}`);
            const blogData = response.data;
            setSelectedBlog(blogData);
            form.setFieldsValue({
                title: blogData.title,
                content: blogData.content,
                body: blogData.body,
                picture: blogData.picture,
                status: blogData.status === 0,
            });
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching blog:", err.response?.data || err.message);
            message.error("Failed to load blog details!");
        }
    };

    // Create blog
    const handleCreate = async (values: {
        title: string;
        content: string;
        body: string;
        picture: string;
        status?: boolean
    }) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                title: values.title,
                content: values.content,
                body: values.body,
                picture: values.picture,
                status: values.status ? 0 : 1,
            };
            await axios.post(`${API_BASE_URL}/Blog/Create_Blog`, payload, { headers });
            message.success("Blog created successfully!");
            setIsCreateModalVisible(false);
            form.resetFields();
            fetchBlogs();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error creating blog:", err.response?.data || err.message);
            message.error("Failed to create blog!");
        }
    };

    // Update blog
    const handleUpdate = async (values: {
        title: string;
        content: string;
        body: string;
        picture: string;
        status: boolean
    }) => {
        if (!selectedBlog) return;

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                id: selectedBlog.id,
                title: values.title,
                content: values.content,
                body: values.body,
                status: values.status ? 0 : 1,
                picture: values.picture,
            };
            await axios.post(`${API_BASE_URL}/Blog/Update_Blog`, payload, { headers });
            message.success("Blog updated successfully!");
            setIsUpdateModalVisible(false);
            setSelectedBlog(null);
            form.resetFields();
            fetchBlogs();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating blog:", err.response?.data || err.message);
            message.error("Failed to update blog!");
        }
    };

    // Update blog status directly from table
    const handleUpdateStatus = async (blog: Blog) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const newStatus = blog.status === 0 ? 1 : 0;
            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                id: blog.id,
                title: blog.title,
                content: blog.content,
                body: blog.body,
                status: newStatus,
                picture: blog.picture,
            };
            await axios.post(`${API_BASE_URL}/Blog/Update_Blog`, payload, { headers });
            message.success("Blog status updated successfully!");
            fetchBlogs();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating blog status:", err.response?.data || err.message);
            message.error("Failed to update blog status!");
        }
    };

    // Show create modal
    const showCreateModal = () => {
        form.resetFields();
        form.setFieldsValue({ status: true });
        setIsCreateModalVisible(true);
    };

    // Show update modal
    const showUpdateModal = (blog: Blog) => {
        fetchBlogById(blog.id);
        setIsUpdateModalVisible(true);
    };

    // Show image modal
    const showImageModal = (picture: string) => {
        setSelectedImage(picture);
        setIsImageModalVisible(true);
    };

    // Format content for display in table
    const formatContent = (content: string) => {
        if (content.length > 100) {
            return content.substring(0, 100) + '...';
        }
        return content;
    };

    // Table columns
    const columns: ColumnsType<Blog> = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
            width: '25%'
        },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            render: (content) => formatContent(content),
            width: '40%'
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: '10%',
            render: (status: number, record: Blog) => {
                return (
                    <Switch
                        checked={status === 0}
                        onChange={() => handleUpdateStatus(record)}
                        checkedChildren={<CheckCircleOutlined />}
                        unCheckedChildren={<CloseCircleOutlined />}
                        className={status === 0 ? "bg-green-500" : "bg-red-500"}
                    />
                );
            },
        },
        {
            title: "Picture",
            dataIndex: "picture",
            key: "picture",
            width: '10%',
            render: (picture: string) => (
                <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => showImageModal(picture)}
                >
                    URL
                </Button>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: '15%',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => showUpdateModal(record)}
                            size="middle"
                            shape="circle"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <Card className="shadow-lg rounded-xl" bordered={false}>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="m-0">
                    <span className="text-blue-600 mr-2">📝</span> Blog Management
                </Title>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={showCreateModal}
                >
                    New Blog
                </Button>
            </div>

            <Divider className="mt-2 mb-6" />

            {loading ? (
                <div className="flex justify-center items-center p-12">
                    <Spin size="large" tip="Loading blogs..." />
                </div>
            ) : blogs.length === 0 ? (
                <Empty description="No blogs found" className="py-12" />
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={blogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                        pagination={false}
                        bordered
                        rowClassName="hover:bg-gray-50"
                        className="border rounded-lg overflow-hidden"
                    />

                    <div className="flex justify-end mt-4">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={blogs.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showTotal={(total) => `Total ${total} blogs`}
                        />
                    </div>
                </>
            )}

            {/* Create Blog Modal */}
            <Modal
                title={<Title level={4}><PlusOutlined className="mr-2" /> Create New Blog</Title>}
                open={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-4">
                    <Form.Item
                        name="title"
                        label="Blog Title"
                        rules={[{ required: true, message: "Please enter the blog title!" }]}
                    >
                        <Input placeholder="Enter blog title" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Blog Content"
                        rules={[{ required: true, message: "Please enter the blog content!" }]}
                    >
                        <TextArea rows={6} placeholder="Enter blog content" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="body"
                        label="Blog Body"
                        rules={[{ required: true, message: "Please enter the blog body!" }]}
                    >
                        <TextArea rows={6} placeholder="Enter blog body" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="picture"
                        label="Picture URL"
                        rules={[{ required: true, message: "Please enter the picture URL!" }]}
                    >
                        <Input placeholder="Enter picture URL" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            className="bg-green-500"
                        />
                    </Form.Item>
                    <Form.Item className="mb-0 flex justify-end">
                        <Space>
                            <Button size="large" onClick={() => setIsCreateModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size="large">
                                Create Blog
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Update Blog Modal */}
            <Modal
                title={<Title level={4}><EditOutlined className="mr-2" /> Update Blog</Title>}
                open={isUpdateModalVisible}
                onCancel={() => {
                    setIsUpdateModalVisible(false);
                    setSelectedBlog(null);
                    form.resetFields();
                }}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} className="pt-4">
                    <Form.Item
                        name="title"
                        label="Blog Title"
                        rules={[{ required: true, message: "Please enter the blog title!" }]}
                    >
                        <Input placeholder="Enter blog title" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Blog Content"
                        rules={[{ required: true, message: "Please enter the blog content!" }]}
                    >
                        <TextArea rows={6} placeholder="Enter blog content" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="body"
                        label="Blog Body"
                        rules={[{ required: true, message: "Please enter the blog body!" }]}
                    >
                        <TextArea rows={6} placeholder="Enter blog body" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="picture"
                        label="Picture URL"
                        rules={[{ required: true, message: "Please enter the picture URL!" }]}
                    >
                        <Input placeholder="Enter picture URL" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            className="bg-green-500"
                        />
                    </Form.Item>
                    <Form.Item className="mb-0 flex justify-end">
                        <Space>
                            <Button
                                size="large"
                                onClick={() => {
                                    setIsUpdateModalVisible(false);
                                    setSelectedBlog(null);
                                    form.resetFields();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size="large">
                                Update Blog
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Image URL View Modal */}
            <Modal
                title={<Title level={4}><LinkOutlined className="mr-2" /> Image URL</Title>}
                open={isImageModalVisible}
                onCancel={() => setIsImageModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsImageModalVisible(false)}>
                        Close
                    </Button>,
                    selectedImage && (
                        <Button
                            key="open"
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => window.open(selectedImage, '_blank')}
                        >
                            Open Image
                        </Button>
                    )
                ]}
                width={600}
            >
                {selectedImage && (
                    <div className="space-y-4">
                        <Input
                            value={selectedImage}
                            readOnly
                            style={{ width: "100%" }}
                            size="large"
                            addonAfter={
                                <Tooltip title="Copy URL">
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedImage);
                                            message.success("URL copied to clipboard!");
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </Tooltip>
                            }
                        />
                        <div className="border rounded p-2 bg-gray-50 text-center">
                            <Text type="secondary">Preview not available. Click 'Open Image' to view.</Text>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default BlogManage;