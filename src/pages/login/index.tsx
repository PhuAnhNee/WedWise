import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Checkbox, notification } from "antd";
import { GoogleOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import AuthService from "../service/AuthService";

// interface LoginValues {
//     email: string;
//     password: string;
// }

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    const showSuccessNotification = () => {
        api.success({
            message: 'Login Successful',
            description: 'Welcome back! You have successfully logged in.',
            icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
            placement: 'topRight',
            duration: 3,
            style: {
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f'
            }
        });
    };

    const showErrorNotification = (errorMessage: string) => {
        api.error({
            message: 'Login Failed',
            description: errorMessage,
            icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />,
            placement: 'topRight',
            duration: 4,
            style: {
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7'
            }
        });
    };

    const onFinish = async (values: { email: string; password: string }) => {
        try {
            setLoading(true);
            await AuthService.login(values);
            showSuccessNotification();

            // Đợi 1 giây trước khi chuyển trang để người dùng có thể thấy thông báo
            setTimeout(() => {
                navigate("/home");
            }, 1000);

        } catch (error) {
            let errorMessage = "An error occurred during login. Please try again.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Xử lý các trường hợp lỗi cụ thể
            if (errorMessage.includes('401')) {
                errorMessage = "Invalid email or password. Please check your credentials.";
            } else if (errorMessage.includes('403')) {
                errorMessage = "Your account has been locked. Please contact support.";
            } else if (errorMessage.includes('429')) {
                errorMessage = "Too many login attempts. Please try again later.";
            } else if (errorMessage.includes('timeout')) {
                errorMessage = "Connection timeout. Please check your internet connection.";
            }

            showErrorNotification(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-6">
                <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row max-w-4xl w-full">
                    {/* Left side image */}
                    <div className="md:w-1/2 hidden md:flex items-center justify-center p-6">
                        <img
                            src="https://i.pinimg.com/736x/ff/56/8c/ff568cd703f5ac83c8f37590f489a321.jpg"
                            alt="Login Illustration"
                            className="w-full rounded-xl"
                        />
                    </div>

                    {/* Login form */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                        <div className="text-center">
                            <img src="/logo.png" alt="Logo" className="mx-auto w-16" />
                            <h2 className="text-3xl font-bold mt-4 text-gray-700">Welcome Back!</h2>
                        </div>

                        <Form layout="vertical" onFinish={onFinish} className="mt-6">
                            <Form.Item
                                label="Email or Phone Number"
                                name="email"
                                rules={[
                                    { required: true, message: "Please enter your email!" },
                                    { type: 'email', message: 'Please enter a valid email address!' }
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter your email"
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Please enter your password!" },
                                    { min: 4, message: "Password must be at least 6 characters!" }
                                ]}
                            >
                                <Input.Password
                                    size="large"
                                    placeholder="Enter password"
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <div className="flex justify-between items-center mb-4">
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox>Remember me</Checkbox>
                                </Form.Item>
                                <a href="#" className="text-blue-600 hover:underline">
                                    Forgot password?
                                </a>
                            </div>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    size="large"
                                    loading={loading}
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </Button>
                            </Form.Item>

                            <Button
                                icon={<GoogleOutlined />}
                                className="w-full"
                                size="large"
                            >
                                Sign in with Google
                            </Button>
                        </Form>

                        <p className="text-center mt-4 text-gray-600">
                            Don't have an account?{" "}
                            <a href="register" className="text-blue-600 hover:underline">
                                Sign up now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;