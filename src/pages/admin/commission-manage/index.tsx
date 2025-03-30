import React, { useEffect, useState } from "react";
import { Button, Form, InputNumber, message, Card, Typography, Divider, Spin, Tooltip } from "antd";
import { PercentageOutlined, SaveOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios, { AxiosError } from "axios";

// Đảm bảo Ant Design được config đúng trong ứng dụng của bạn
// Thêm dòng này vào file main.tsx hoặc App.tsx nếu chưa có:
// import { MessageInstance } from 'antd/es/message/interface';
// message.config({ duration: 3, maxCount: 1 });

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

    // Fetch current commission
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
            message.error({
                content: "Failed to load commission!",
                duration: 3,
            });
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
                message.error({
                    content: "Unauthorized: Please log in again.",
                    duration: 3,
                });
                setLoading(false);
                return;
            }

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };
            const payload = { commission: values.commission };

            const response = await axios.post(`${API_BASE_URL}/Booking/Update_Commission`, payload, { headers });

            // Kiểm tra response từ server nếu có
            if (response.status === 200 || response.status === 201) {
                message.success({
                    content: `Commission updated successfully from ${currentCommission}% to ${values.commission}%!`,
                    duration: 3,
                    style: {
                        marginTop: '20vh', // Đưa thông báo lên cao hơn một chút
                    },
                });
                setCurrentCommission(values.commission);
                await fetchCommission(); // Refresh data
            }
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error updating commission:", err.response?.data || err.message);
            message.error({
                content: "Failed to update commission!",
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

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