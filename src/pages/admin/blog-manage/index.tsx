import React, { useEffect, useState, useRef } from "react";
import {
    Table, Button, Modal, Form, Input, Pagination, Switch,
    Card, Typography, Space, Tooltip, Spin, Empty, Divider
} from "antd";
import {
    EditOutlined, PlusOutlined, EyeOutlined,
    LinkOutlined, CheckCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";
import { Editor } from '@tinymce/tinymce-react';
import CustomMessage from "../../../component/message/index";

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

interface TinyMCEEditor {
    getContent(): string;
    setContent(content: string): void;
}

// Define types for TinyMCE AI Request
interface AIRequest {
    prompt: string;
}

interface AIRespondWith {
    string: (callback: () => string | Promise<string>) => void;
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
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
    const [form] = Form.useForm();
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const pageSize: number = 5;

    // Fetch all blogs
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Blog[]>(`${API_BASE_URL}/Blog/Get_All_Blog`);
            setBlogs(response.data.map((blog) => ({ ...blog, key: blog.id })));
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching blogs:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to load blogs!" });
        } finally {
            setLoading(false);
        }
    };

    // Fetch blog by ID
    const fetchBlogById = async (id: string) => {
        try {
            const response = await axios.get<Blog>(`${API_BASE_URL}/Blog/Get_Blog_By_Id?id=${id}`);
            const blogData = response.data;
            setSelectedBlog(blogData);
            form.setFieldsValue({
                title: blogData.title,
                content: blogData.content,
                picture: blogData.picture,
                status: blogData.status === 0,
            });
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching blog:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to load blog details!" });
        }
    };

    // Create blog
    const handleCreate = async (values: { title: string; content: string; picture: string; status?: boolean }) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setMessage({ type: "error", text: "Unauthorized: Please log in again." });
                return;
            }

            const formData = new FormData();
            formData.append("Title", values.title);
            formData.append("Content", values.content);
            formData.append("Body", editorRef.current?.getContent() || "");
            formData.append("Picture", values.picture);
            formData.append("Status", values.status ? "0" : "1");

            const headers = { Authorization: `Bearer ${accessToken}` };
            await axios.post(`${API_BASE_URL}/Blog/Create_Blog`, formData, { headers });
            setMessage({ type: "success", text: "Blog created successfully!" });
            setTimeout(() => {
                setIsCreateModalVisible(false);
                form.resetFields();
                if (editorRef.current) editorRef.current.setContent("");
                fetchBlogs();
                setMessage(null);
            }, 1000);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error creating blog:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to create blog!" });
        }
    };

    // Update blog
    const handleUpdate = async (values: { title: string; content: string; picture: string; status: boolean }) => {
        if (!selectedBlog) return;

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setMessage({ type: "error", text: "Unauthorized: Please log in again." });
                return;
            }

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };
            const payload = {
                id: selectedBlog.id,
                title: values.title,
                content: values.content,
                body: editorRef.current?.getContent() || "",
                picture: values.picture,
                status: values.status ? 0 : 1
            };
            await axios.post(`${API_BASE_URL}/Blog/Update_Blog`, payload, { headers });
            setMessage({ type: "success", text: "Blog updated successfully!" });
            setTimeout(() => {
                setIsUpdateModalVisible(false);
                setSelectedBlog(null);
                form.resetFields();
                if (editorRef.current) editorRef.current.setContent("");
                fetchBlogs();
                setMessage(null);
            }, 1000);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating blog:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to update blog!" });
        }
    };

    // Update blog status
    const handleUpdateStatus = async (blog: Blog) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setMessage({ type: "error", text: "Unauthorized: Please log in again." });
                return;
            }

            const newStatus = blog.status === 0 ? 1 : 0;
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };
            const payload = { ...blog, status: newStatus };
            await axios.post(`${API_BASE_URL}/Blog/Update_Blog`, payload, { headers });
            setMessage({ type: "success", text: "Blog status updated successfully!" });
            setTimeout(() => {
                fetchBlogs();
                setMessage(null);
            }, 1000);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating blog status:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to update blog status!" });
        }
    };

    // Show modals
    const showCreateModal = () => {
        form.resetFields();
        form.setFieldsValue({ status: true });
        if (editorRef.current) editorRef.current.setContent("");
        setIsCreateModalVisible(true);
    };

    const showUpdateModal = (blog: Blog) => {
        fetchBlogById(blog.id);
        setIsUpdateModalVisible(true);
    };

    const showImageModal = (picture: string) => {
        setSelectedImage(picture);
        setIsImageModalVisible(true);
    };

    // Format content for table
    const formatContent = (content: string) => {
        return content.length > 100 ? content.substring(0, 100) + "..." : content;
    };

    // Table columns
    const columns: ColumnsType<Blog> = [
        { title: "Title", dataIndex: "title", key: "title", ellipsis: true, width: "25%" },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            render: formatContent,
            width: "40%",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: "10%",
            render: (status: number, record: Blog) => (
                <Switch
                    checked={status === 0}
                    onChange={() => handleUpdateStatus(record)}
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<CloseCircleOutlined />}
                    className={status === 0 ? "bg-green-500" : "bg-red-500"}
                />
            ),
        },
        {
            title: "Picture",
            dataIndex: "picture",
            key: "picture",
            width: "10%",
            render: (picture: string) => (
                <Button type="link" icon={<LinkOutlined />} onClick={() => showImageModal(picture)}>
                    URL
                </Button>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: "15%",
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

    // TinyMCE configuration
    const tinyMCEConfig = {
        apiKey: 'zsu20pf6kop17ctxn8smlexadhq4aia84atp8iejw6l1tbml',
        init: {
            height: 300,
            menubar: true,
            plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
            ],
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            tinycomments_mode: 'embedded',
            tinycomments_author: 'Author name',
            mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
            ],
            ai_request: (_request: AIRequest, respondWith: AIRespondWith) =>
                respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }
    };

    return (
        <div className="p-4">
            {message && <CustomMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}
            <Card className="shadow-lg rounded-xl" bordered={false}>
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} className="m-0">
                        <span className="text-blue-600 mr-2">📝</span> Blog Management
                    </Title>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={showCreateModal}>
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
                        <Form.Item name="title" label="Blog Title" rules={[{ required: true, message: "Please enter the blog title!" }]}>
                            <Input placeholder="Enter blog title" size="large" />
                        </Form.Item>
                        <Form.Item name="content" label="Blog Content" rules={[{ required: true, message: "Please enter the blog content!" }]}>
                            <TextArea rows={6} placeholder="Enter blog content" size="large" />
                        </Form.Item>
                        <Form.Item label="Blog Body" rules={[{ required: true, message: "Please enter the blog body!" }]}>
                            <Editor
                                apiKey={tinyMCEConfig.apiKey}
                                onInit={(_, editor) => (editorRef.current = editor)}
                                initialValue=""
                                init={tinyMCEConfig.init}
                            />
                        </Form.Item>
                        <Form.Item name="picture" label="Picture URL" rules={[{ required: true, message: "Please enter the picture URL!" }]}>
                            <Input placeholder="Enter picture URL" size="large" />
                        </Form.Item>
                        <Form.Item name="status" label="Status" valuePropName="checked" initialValue={true}>
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" className="bg-green-500" />
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
                {/* Update Blog Modal */}
                <Modal
                    title={<Title level={4}><EditOutlined className="mr-2" /> Update Blog</Title>}
                    open={isUpdateModalVisible}
                    onCancel={() => {
                        setIsUpdateModalVisible(false);
                        setSelectedBlog(null);
                        form.resetFields();
                        if (editorRef.current) editorRef.current.setContent("");
                    }}
                    footer={null}
                    width={700}
                    destroyOnClose
                >
                    {selectedBlog ? (
                        <Form form={form} layout="vertical" onFinish={handleUpdate} className="pt-4">
                            <Form.Item name="title" label="Blog Title" rules={[{ required: true, message: "Please enter the blog title!" }]}>
                                <Input placeholder="Enter blog title" size="large" />
                            </Form.Item>
                            <Form.Item name="content" label="Blog Content" rules={[{ required: true, message: "Please enter the blog content!" }]}>
                                <TextArea rows={6} placeholder="Enter blog content" size="large" />
                            </Form.Item>
                            <Form.Item label="Blog Body" rules={[{ required: true, message: "Please enter the blog body!" }]}>
                                <Editor
                                    apiKey={tinyMCEConfig.apiKey}
                                    onInit={(_, editor) => {
                                        editorRef.current = editor;
                                        if (selectedBlog.body) {
                                            editor.setContent(selectedBlog.body);
                                        }
                                    }}
                                    initialValue={selectedBlog.body || ""}
                                    init={tinyMCEConfig.init}
                                />
                            </Form.Item>
                            <Form.Item name="picture" label="Picture URL" rules={[{ required: true, message: "Please enter the picture URL!" }]}>
                                <Input placeholder="Enter picture URL" size="large" />
                            </Form.Item>
                            <Form.Item name="status" label="Status" valuePropName="checked">
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" className="bg-green-500" />
                            </Form.Item>
                            <Form.Item className="mb-0 flex justify-end">
                                <Space>
                                    <Button size="large" onClick={() => { setIsUpdateModalVisible(false); setSelectedBlog(null); form.resetFields(); }}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" size="large">
                                        Update Blog
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    ) : (
                        <div className="flex justify-center items-center p-12">
                            <Spin size="large" tip="Loading blog details..." />
                        </div>
                    )}
                </Modal>

                {/* Image URL View Modal */}
                <Modal
                    title={<Title level={4}><LinkOutlined className="mr-2" /> Image URL</Title>}
                    open={isImageModalVisible}
                    onCancel={() => setIsImageModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsImageModalVisible(false)}>Close</Button>,
                        selectedImage && (
                            <Button key="open" type="primary" icon={<EyeOutlined />} onClick={() => window.open(selectedImage, "_blank")}>
                                Open Image
                            </Button>
                        ),
                    ]}
                    width={600}
                >
                    {selectedImage && (
                        <div className="space-y-4">
                            <Input
                                value={selectedImage}
                                readOnly
                                size="large"
                                addonAfter={
                                    <Tooltip title="Copy URL">
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedImage);
                                                setMessage({ type: "success", text: "URL copied to clipboard!" });
                                                setTimeout(() => setMessage(null), 1000);
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
        </div>
    );
};

export default BlogManage;