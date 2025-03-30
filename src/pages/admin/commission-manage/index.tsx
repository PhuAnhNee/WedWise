import React, { useEffect, useState } from "react";
import { Button, Form, InputNumber, message, Card, Typography, Divider, Spin, Tooltip } from "antd";
import { PercentageOutlined, SaveOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios, { AxiosError } from "axios";

const { Title, Text } = Typography;

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface CommissionData {
    commission: number;
}

const Commission: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Fetch current commission
    const fetchCommission = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
            const response = await axios.get<CommissionData>(`${API_BASE_URL}/Booking/Get_Commission`, { headers });
            form.setFieldsValue({ commission: response.data.commission });
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching commission:", err.response?.data || err.message);
            message.error("Failed to load commission!");
        } finally {
            setInitializing(false);
        }
    };

    // Update commission
    const handleUpdateCommission = async (values: { commission: number }) => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                setLoading(false);
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = { commission: values.commission };
            await axios.post(`${API_BASE_URL}/Booking/Update_Commission`, payload, { headers });
            message.success("Commission updated successfully!");
            fetchCommission(); // Refresh the commission value after update
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating commission:", err.response?.data || err.message);
            message.error("Failed to update commission!");
        } finally {
            setLoading(false);
        }
    };

    // Load commission on component mount
    useEffect(() => {
        fetchCommission();
    }, []);

    return (
        <Card
            className="shadow-lg rounded-xl"
            bordered={false}
            style={{ maxWidth: "600px", margin: "0 auto" }}
        >
            {initializing ? (
                <div className="flex justify-center items-center p-12">
                    <Spin size="large" tip="Loading commission data..." />
                </div>
            ) : (
                <>
                    <Title level={2} className="flex items-center mb-1">
                        <PercentageOutlined className="mr-2 text-green-600" />
                        Commission Management
                    </Title>
                    <Text type="secondary" className="block mb-6">
                        Set the standard commission percentage for each therapist
                    </Text>
                    <Divider className="my-6" />
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateCommission}
                        initialValues={{ commission: 0 }}
                        className="max-w-md"
                    >
                        <Form.Item
                            name="commission"
                            label={
                                <span className="flex items-center text-lg">
                                    Commission Percentage
                                    <Tooltip title="This is the percentage that will be charged to each therapist per booking">
                                        <InfoCircleOutlined className="ml-2 text-blue-500" />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { required: true, message: "Please enter the commission percentage!" },
                                { type: "number", min: 0, max: 100, message: "Percentage must be between 0 and 100!" },
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                size="large"
                                step={0.1}
                                precision={1}
                                formatter={value => `${value}%`}
                                parser={value => value!.replace('%', '')}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                        <Form.Item className="mt-8">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                                size="large"
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Update Commission
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            )}
        </Card>
    );
};

export default Commission;