import { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import AuthService from "../service/AuthService";
import { useNavigate } from "react-router-dom";

interface RegisterFormValues {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  avatarUrl: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const showSuccessNotification = () => {
    api.success({
      message: 'Registration Successful',
      description: 'Your account has been created successfully!',
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
      message: 'Registration Failed',
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

  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      const { fullName, phone, email, password, avatarUrl } = values;
      const user = {
        fullName,
        phone,
        email,
        password,
        avatarUrl,
        role: "2", // Chuyển số thành chuỗi
      };

      const response = await AuthService.register(user);
      
      // Add debug logs similar to login component
      console.log("Register Response:", response);
      console.log("Access Token:", response.accessToken);
      console.log("Stored token:", AuthService.getToken());
      const decodedToken = AuthService.getDecodedToken();
      console.log("Decoded Token:", decodedToken);
      
      showSuccessNotification();

      // Đợi 1 giây trước khi chuyển trang để người dùng có thể thấy thông báo
      setTimeout(() => {
        navigate("/"); // Điều hướng về trang đăng nhập
      }, 1000);
      
    } catch (error) {
      let errorMessage = "An error occurred during registration. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Xử lý các trường hợp lỗi cụ thể
      if (errorMessage.includes('409')) {
        errorMessage = "This email is already registered. Please use another email.";
      } else if (errorMessage.includes('400')) {
        errorMessage = "Invalid registration data. Please check your information.";
      } else if (errorMessage.includes('429')) {
        errorMessage = "Too many registration attempts. Please try again later.";
      } else if (errorMessage.includes('timeout')) {
        errorMessage = "Connection timeout. Please check your internet connection.";
      }

      showErrorNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
      {contextHolder}
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
        {/* Hình ảnh bên trái */}
        <div className="w-1/2 hidden md:block">
          <img
            src="https://i.pinimg.com/736x/d8/93/d3/d893d30d343b821080a3a7d983822cdb.jpg"
            alt="Register illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form đăng ký */}
        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

          <Form
            name="register"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Please enter your full name!" }]}
            >
              <Input size="large" placeholder="Enter your full name" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please enter your phone number!" }]}
            >
              <Input size="large" placeholder="Enter your phone number" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Please enter a valid email address!" },
              ]}
            >
              <Input size="large" placeholder="Enter your email" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
                { min: 4, message: "Password must be at least 4 characters!" }
              ]}
            >
              <Input.Password size="large" placeholder="Enter your password" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              label="Avatar URL"
              name="avatarUrl"
              rules={[{ required: true, message: "Please provide your avatar URL!" }]}
            >
              <Input size="large" placeholder="Enter your avatar URL" className="rounded-lg" />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Button type="primary" htmlType="submit" size="large" className="w-full" loading={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <a href="/" className="text-blue-500">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;