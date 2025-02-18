import { useState } from "react";
import { Form, Input, Button, message } from "antd";
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

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      const { fullName, phone, email, password, avatarUrl } = values;
      const user = {
        fullName,
        phone,
        email,
        password,
        avatarUrl,
        role: 1, // Role mặc định là 1 (user)
      };

      const response = await AuthService.register(user);

      if (response && response.status === 200) {
        message.success("Registration successful");
        setTimeout(() => {
          navigate("/"); // Điều hướng về trang đăng nhập
        }, 1000);
      } else {
        message.error("Registration failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "Registration failed");
      } else {
        message.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
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
              rules={[{ required: true, message: "Please enter your password!" }]}
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
                Register
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
