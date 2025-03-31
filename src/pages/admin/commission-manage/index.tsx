import React, { useEffect, useState } from "react";
import { Button, Form, InputNumber, Card, Typography, Divider, Spin, Tooltip } from "antd";
import { PercentageOutlined, SaveOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios, { AxiosError } from "axios";
import CustomMessage from "../../../component/message/index";

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
    const [currentCommission, setCurrentCommission] = useState<number>(0);
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

    const fetchCommission = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
            const response = await axios.get<CommissionData>(`${API_BASE_URL}/Booking/Get_Commission`, { headers });
            form.setFieldsValue({ commission: response.data.commission });
            setCurrentCommission(response.data.commission);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching commission:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to load commission!" });
        } finally {
            setInitializing(false);
        }
    };

    const handleUpdateCommission = async (values: { commission: number }) => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setMessage({ type: "error", text: "Unauthorized: Please log in again." });
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = { commission: values.commission };
            const response = await axios.post(`${API_BASE_URL}/Booking/Update_Commission`, payload, { headers });

            if (response.status === 200 || response.status === 201) {
                setMessage({ type: "success", text: `Commission updated successfully from ${currentCommission}% to ${values.commission}%!` });
                setCurrentCommission(values.commission);
                await fetchCommission();
                setTimeout(() => setMessage(null), 1000);
            }
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating commission:", err.response?.data || err.message);
            setMessage({ type: "error", text: "Failed to update commission!" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommission();
    }, []);

    return (
        <div className="p-4">
            {message && <CustomMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}
            <Card className="shadow-lg rounded-xl" bordered={false} style={{ maxWidth: "600px", margin: "0 auto" }}>
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
                            Set the standard commission percentage
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
                                        <Tooltip title="This is the percentage that will be charged the whole system">
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
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value!.replace("%", "")}
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
        </div>
    );
};

export default Commission;