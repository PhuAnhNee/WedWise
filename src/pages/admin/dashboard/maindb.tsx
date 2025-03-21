import { useState } from "react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BarChartOutlined,
    SettingOutlined,
    UserOutlined,
    FormOutlined,
    AppstoreOutlined,
    FileDoneOutlined,
    FileProtectOutlined,
    CarryOutOutlined,
    AuditOutlined,
    QuestionOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Avatar, Dropdown, message } from "antd";
import { useNavigate } from "react-router-dom";
import DashboardHome from "../dashboard/index";
import WithDraw from "../withdraw/index";
import SalesReport from "../sales-report";
import Settings from "../setting";
import QuizManage from "../quiz-manage";
import AnswerManage from "../answer-manage";
import BookingManage from "../booking-manage";
import QuestionManage from "../question-manage";
import Specification from "../specification";
import BlogManage from "../blog-manage";
import CommissionManage from "../commission-manage";
import UpdateSpec from "../update-therapist-specification";
import Result from "../result";
import Feedback from "../feedback";
import Manage from "../manage/index";

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedPage, setSelectedPage] = useState("dashboard");
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Hàm để render trang tương ứng khi chọn menu
    const renderContent = () => {
        switch (selectedPage) {
            case "dashboard":
                return <DashboardHome />;
            case "withdraw":
                return <WithDraw />;
            case "booking-manage":
                return <BookingManage />;
            case "salesreport":
                return <SalesReport />;
            case "manage":
                return <Manage />;
            case "quiz-manage":
                return <QuizManage />;
            case "result":
                return <Result />;
            case "specification":
                return <Specification />;
            case "blog-manage":
                return <BlogManage />;
            case "update-spec":
                return <UpdateSpec />;
            case "answer-manage":
                return <AnswerManage />;
            case "question-manage":
                return <QuestionManage />;
            case "commission-manage":
                return <CommissionManage />;
            case "feedback":
                return <Feedback />;
            case "settings":
                return <Settings />;
            default:
                return <DashboardHome />;
        }
    };

    // Xử lý Logout
    const handleLogout = () => {
        localStorage.removeItem("accessToken"); // Xóa accessToken khỏi localStorage
        message.success("Logged out successfully!");
        setTimeout(() => {
            navigate("/"); // Điều hướng về trang Login
        }, 1000);
    };

    // Menu dropdown khi click vào Avatar
    const userMenu = (
        <Menu
            onClick={({ key }) => {
                if (key === "profile") {
                    navigate("/admin/profile"); // Chuyển hướng đến trang Profile Admin
                } else if (key === "settings") {
                    setSelectedPage("settings"); // Chuyển sang trang Settings trong dashboard
                } else if (key === "logout") {
                    handleLogout(); // Gọi hàm logout
                }
            }}
            items={[
                { key: "profile", icon: <UserOutlined />, label: "Profile" },
                { key: "settings", icon: <SettingOutlined />, label: "Settings" },
                { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
            ]}
        />
    );

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="text-white text-center py-4 text-xl font-bold">
                    {collapsed ? "D" : "Dashboard"}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedPage]}
                    onClick={(e) => setSelectedPage(e.key)}
                >
                    <Menu.Item key="dashboard" icon={<AppstoreOutlined />}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item key="withdraw" icon={<BarChartOutlined />}>
                        Therapist
                    </Menu.Item>
                    <Menu.Item key="booking-manage" icon={<CarryOutOutlined />}>
                        Booking Manage
                    </Menu.Item>
                    <Menu.Item key="specification" icon={<FileProtectOutlined />}>
                        Specification
                    </Menu.Item>
                    <Menu.Item key="update-spec" icon={<FileProtectOutlined />}>
                        Update Therapist
                    </Menu.Item>
                    <Menu.Item key="manage" icon={<FormOutlined />}>
                        Manage
                    </Menu.Item>
                    <Menu.Item key="quiz-manage" icon={<FileDoneOutlined />}>
                        Quiz Manage
                    </Menu.Item>
                    <Menu.Item key="question-manage" icon={<QuestionOutlined />}>
                        Question Manage
                    </Menu.Item>
                    <Menu.Item key="answer-manage" icon={<FileProtectOutlined />}>
                        Answer Manage
                    </Menu.Item>
                    <Menu.Item key="result" icon={<FileProtectOutlined />}>
                        Quiz Result
                    </Menu.Item>
                    <Menu.Item key="feedback" icon={<AuditOutlined />}>
                        Feedback
                    </Menu.Item>
                    <Menu.Item key="commission-manage" icon={<FileProtectOutlined />}>
                        Commission
                    </Menu.Item>
                    <Menu.Item key="blog-manage" icon={<FileProtectOutlined />}>
                        Blog Manage
                    </Menu.Item>
                </Menu>
            </Sider>

            {/* Main Layout */}
            <Layout>
                {/* Header */}
                <Header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 16px",
                        background: colorBgContainer,
                    }}
                >
                    {/* Nút Toggle Sidebar */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: "18px" }}
                    />

                    {/* Avatar & Dropdown Menu */}
                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <Avatar size="large" icon={<UserOutlined />} className="cursor-pointer" />
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: "16px",
                        padding: "24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {renderContent()} {/* Hiển thị trang tương ứng */}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;