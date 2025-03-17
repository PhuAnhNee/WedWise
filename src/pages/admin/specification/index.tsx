import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, message, Spin } from "antd";
import axios, { AxiosError } from "axios";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Specification {
    specificationId?: string;
    name: string;
    description: string;
    level: number;
    therapists?: Therapist[] | null;
}

interface Therapist {
    therapistId: string;
    therapistName: string;
    avatar: string;
    status: boolean;
    description: string;
    consultationFee: number;
    meetUrl: string;
    schedules: string | null;
    specialty: string | null;
    certificates: string | null;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    createdUser: string | null;
    updatedUser: string | null;
}

const SpecificationManager: React.FC = () => {
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpecification, setSelectedSpecification] = useState<Specification | null>(null);
    const [form] = Form.useForm();

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
        Accept: "*/*",
    });

    // Fetch all specifications
    const fetchSpecifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Specification[]>(
                `${API_BASE_URL}/Specification/Get_All_Specification`,
                { headers: getHeaders(), timeout: 10000 }
            );
            if (!Array.isArray(response.data)) {
                throw new Error("Invalid response format");
            }
            setSpecifications(response.data);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            message.error(err.response?.data?.message || "Failed to load specifications!");
        } finally {
            setLoading(false);
        }
    };

    // Fetch specification by ID
    const fetchSpecificationById = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.get<Specification>(
                `${API_BASE_URL}/Specification/Get_Specification_By_Id?id=${id}`,
                { headers: getHeaders(), timeout: 10000 }
            );
            return response.data;
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            message.error(err.response?.data?.message || "Failed to load specification!");
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecifications();
    }, []);

    const handleAddSpecification = () => {
        setSelectedSpecification(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditSpecification = async (specification: Specification) => {
        const spec = await fetchSpecificationById(specification.specificationId!);
        if (spec) {
            setSelectedSpecification(spec);
            form.setFieldsValue({
                name: spec.name,
                description: spec.description,
                level: spec.level,
            });
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            console.log("Form values:", JSON.stringify(values, null, 2));

            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const payload = {
                specificationId: selectedSpecification?.specificationId || "",
                name: values.name,
                description: values.description || "",
                level: Number(values.level),
            };

            let response;
            if (selectedSpecification) {
                // Update specification
                console.log("Submitting update payload:", JSON.stringify(payload, null, 2));
                response = await axios.post(
                    `${API_BASE_URL}/Specification/Update_Specification`,
                    payload,
                    { headers: getHeaders() }
                );
                message.success("Specification updated successfully!");
            } else {
                // Create specification
                const createPayload = {
                    name: values.name,
                    description: values.description || "",
                    level: Number(values.level),
                };
                console.log("Submitting create payload:", JSON.stringify(createPayload, null, 2));
                response = await axios.post(
                    `${API_BASE_URL}/Specification/Create_Specification`,
                    createPayload,
                    { headers: getHeaders() }
                );
                message.success("Specification created successfully!");
            }

            console.log("Response:", response.data);
            await fetchSpecifications();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error("Full error:", error);
            if (axios.isAxiosError(error)) {
                const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
                console.error("Error response:", JSON.stringify(err.response?.data, null, 2));
                const errorMessage = err.response?.data?.message || `Failed to ${selectedSpecification ? 'update' : 'create'} specification!`;
                message.error(errorMessage);
                if (err.response?.status === 400) {
                    const validationErrors = err.response?.data?.errors
                        ? Object.values(err.response.data.errors).flat().join("; ")
                        : "Invalid request data.";
                    message.error(`Bad request: ${validationErrors}`);
                } else if (err.response?.status === 401) {
                    message.error("Session expired, please log in again.");
                }
            } else {
                message.error("An unexpected error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchSpecifications();
    };

    const columns = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Level",
            dataIndex: "level",
            key: "level",
            sorter: (a: Specification, b: Specification) => a.level - b.level,
        },
        {
            title: "Therapists",
            key: "therapists",
            render: (_: unknown, record: Specification) =>
                record.therapists?.length || 0,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: Specification) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditSpecification(record)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Specification Management</h2>
                <div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSpecification}
                        className="mr-2"
                    >
                        Add Specification
                    </Button>
                    <Button onClick={handleRefresh}>Refresh</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    dataSource={specifications}
                    columns={columns}
                    rowKey="specificationId"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20"],
                    }}
                    scroll={{ x: 1000 }}
                />
            )}

            <Modal
                title={selectedSpecification ? "Edit Specification" : "New Specification"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={selectedSpecification ? "Update" : "Create"}
                confirmLoading={loading}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            { required: true, message: "Please enter a name" },
                            { min: 1, message: "Name must be at least 1 character" },
                            { max: 100, message: "Name cannot exceed 100 characters" },
                        ]}
                    >
                        <Input placeholder="Specification name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { required: true, message: "Please enter a description" },
                            { min: 1, message: "Description must be at least 1 character" },
                            { max: 500, message: "Description cannot exceed 500 characters" },
                        ]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter specification description" />
                    </Form.Item>

                    <Form.Item
                        name="level"
                        label="Level"
                        rules={[
                            { required: true, message: "Please enter a level" },
                            { type: "number", min: 0, message: "Level must be 0 or higher" },
                        ]}
                        normalize={(value) => (value ? Number(value) : value)}
                    >
                        <Input type="number" min={0} step={1} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpecificationManager;