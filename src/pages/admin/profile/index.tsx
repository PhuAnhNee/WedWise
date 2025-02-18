import React from "react";
import { Card, Avatar, Button, Typography } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminProfile: React.FC = () => {
    const adminData = {
        name: "Admin Name",
        email: "admin@example.com",
        role: "Administrator",
        avatar: "", // Có thể thay bằng URL ảnh
    };

    return (
        <div className="p-6 flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <div className="flex flex-col items-center">
                    <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={adminData.avatar}
                        className="mb-4"
                    />
                    <Title level={4}>{adminData.name}</Title>
                    <Text type="secondary">{adminData.email}</Text>
                    <Text className="mt-2 bg-gray-200 px-3 py-1 rounded text-sm">
                        {adminData.role}
                    </Text>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        className="mt-4"
                    >
                        Chỉnh sửa
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AdminProfile;
