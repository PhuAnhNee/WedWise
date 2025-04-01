import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, ShoppingCart, BookOpen } from "lucide-react";
import axios, { AxiosError } from "axios";
import { Spin, Modal, Pagination, Select } from "antd";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface User {
    userId: string;
    fullName: string;
    isActive: boolean;
    email: string;
    role: number; // 1 = Admin, 2 = Member, 3 = Therapist
    bookings: string[];
}

interface Withdrawal {
    id: string;
    customerId: string;
    money: number;
    status: number;
    customer: null | string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    createdUser: null | string;
    updatedUser: null | string;
}

interface Blog {
    id: string;
    title: string;
    content: string;
    thumbnail: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    createdUser: null | string;
    updatedUser: null | string;
}

interface LineChartDataItem {
    name: string;
    value: number;
}

interface PieChartDataItem {
    name: string;
    value: number;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981"];

const Dashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [withdrawalsPage, setWithdrawalsPage] = useState<number>(1);
    const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(null);
    const [lineChartData, setLineChartData] = useState<LineChartDataItem[]>([]);
    const [pieChartData, setPieChartData] = useState<PieChartDataItem[]>([]);
    const [selectedRole, setSelectedRole] = useState<number | null>(null); // Bộ lọc role
    const pageSize = 10;
    const withdrawalsPageSize = 10;

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJiMmZiNjNkNS0xMTdhLTQxY2ItOTA3ZS1iYjAyYWRhYWQyZWUiLCJOYW1lIjoiYWRtaW4iLCJFbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsIlBob25lIjoiMTIzNDU2NzgiLCJSb2xlIjoiQURNSU4iLCJBdmF0YXIiOiJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3N0dWRlbnQtNTFlNmEuYXBwc3BvdC5jb20vby9pbWFnZXMlMkY2Mzg3NjU5OTQzNjE1MTU1NDVfYXZhdGFyLmpwZz9hbHQ9bWVkaWEmdG9rZW49OWIzYjlhZGQtNzZkYy00NzI5LTg0ZmEtZTQ5YjI2NWRlZjEyIiwiZXhwIjoxNzQxODc5MjY0LCJpc3MiOiJQcmUtbWFyaXRhbCBDb3Vuc2VsaW5nIFBsYXRmb3JtIiwiYXVkIjoiUHJlLW1hcml0YWwgQ291bnNlbGluZyBQbGF0Zm9ybSJ9.D_zEEAqe9b3RFVemCidtMAEkK6Jztop9Dj-okpmu4IA"}`,
        Accept: "*/*",
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get<User[]>(`${API_BASE_URL}/Account/Get_All_Users`, {
                headers: getHeaders(),
            });
            setUsers(response.data);
            setFilteredUsers(response.data); // Ban đầu hiển thị tất cả
            generatePieChartData(response.data);
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error fetching users:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Withdrawal[]>(`${API_BASE_URL}/Withdraw/Get_All_Withdraws`, {
                headers: getHeaders(),
            });
            setAllWithdrawals(response.data);
            generateLineChartData(response.data);
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error fetching all withdrawals:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Blog[]>(`${API_BASE_URL}/Blog/Get_All_Blog`, {
                headers: getHeaders(),
            });
            setBlogs(response.data);
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error fetching blogs:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateLineChartData = (withdrawalData: Withdrawal[]) => {
        const withdrawalsByMonth = withdrawalData.reduce((acc: Record<string, number>, withdrawal) => {
            const date = new Date(withdrawal.createdAt);
            const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
            if (!acc[monthYear]) {
                acc[monthYear] = 0;
            }
            acc[monthYear] += withdrawal.money;
            return acc;
        }, {});

        const chartData = Object.entries(withdrawalsByMonth).map(([name, value]) => ({
            name,
            value,
        }));

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        chartData.sort((a, b) => {
            const monthA = a.name.split(" ")[0];
            const monthB = b.name.split(" ")[0];
            return months.indexOf(monthA) - months.indexOf(monthB);
        });

        let resultData = chartData.slice(-7);
        if (resultData.length === 0) {
            resultData = [
                { name: "Jan", value: 0 },
                { name: "Feb", value: 0 },
                { name: "Mar", value: 0 },
                { name: "Apr", value: 0 },
                { name: "May", value: 0 },
                { name: "Jun", value: 0 },
                { name: "Jul", value: 0 },
            ];
        }
        setLineChartData(resultData);
    };

    const generatePieChartData = (userData: User[]) => {
        const activeUsers = userData.filter((user) => user.isActive).length;
        const inactiveUsers = userData.length - activeUsers;
        const usersWithWithdrawals = new Set(allWithdrawals.map((withdrawal) => withdrawal.customerId)).size;

        const chartData = [
            { name: "Active Users", value: activeUsers },
            { name: "Inactive Users", value: inactiveUsers },
            { name: "Users with Withdrawals", value: usersWithWithdrawals },
            { name: "Blog Articles", value: blogs.length },
        ];
        setPieChartData(chartData);
    };

    const fetchWithdrawals = async (user: User) => {
        setLoading(true);
        try {
            const response = await axios.get<Withdrawal[]>(`${API_BASE_URL}/Withdraw/Get_Withdraw_By_UserId?id=${user.userId}`, {
                headers: getHeaders(),
            });
            setWithdrawals(response.data);
            setSelectedUser(user);
            setModalVisible(true);
            setWithdrawalsPage(1);
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error fetching withdrawals:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateWithdrawalStatus = async (withdrawalId: string, newStatus: number) => {
        setUpdatingWithdrawal(withdrawalId);
        try {
            await axios.post(
                `${API_BASE_URL}/Withdraw/Update_Withdraw`,
                {
                    id: withdrawalId,
                    status: newStatus,
                },
                {
                    headers: getHeaders(),
                }
            );
            if (selectedUser) {
                await fetchWithdrawals(selectedUser);
            }
            await fetchAllWithdrawals();
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error updating withdrawal:", err.response?.data || err.message);
        } finally {
            setUpdatingWithdrawal(null);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusDisplay = (status: number) => {
        switch (status) {
            case 0:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 1:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Accepted</span>;
            case 2:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
        }
    };

    // Hàm lọc người dùng theo role
    const filterUsersByRole = (role: number | null) => {
        setSelectedRole(role);
        if (role === null) {
            setFilteredUsers(users); // Hiển thị tất cả
        } else {
            setFilteredUsers(users.filter((user) => user.role === role));
        }
        setCurrentPage(1); // Reset về trang đầu khi lọc
    };

    useEffect(() => {
        fetchUsers();
        fetchAllWithdrawals();
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            generatePieChartData(users);
        }
    }, [users, allWithdrawals, blogs]);

    const handleUserClick = (user: User) => {
        fetchWithdrawals(user);
    };

    const cardsData = [
        { title: "Total Users", value: users.length.toString(), icon: Users, color: "from-violet-500 to-purple-600", percentage: "+0%" },
        { title: "Active Users", value: users.filter((u) => u.isActive).length.toString(), icon: Users, color: "from-cyan-500 to-teal-600", percentage: "+4.3%" },
        { title: "Blogs", value: blogs.length.toString(), icon: BookOpen, color: "from-emerald-500 to-green-600", percentage: "+12.5%" },
        { title: "Withdrawals", value: allWithdrawals.length.toString(), icon: ShoppingCart, color: "from-amber-500 to-orange-600", percentage: "+0%" },
    ];

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const paginatedWithdrawals = withdrawals.slice((withdrawalsPage - 1) * withdrawalsPageSize, withdrawalsPage * withdrawalsPageSize);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1500px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
                    <div className="bg-white px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-600">
                        Last Updated: Today, 08:00 AM PDT
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cardsData.map((card, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {loading && (card.title === "Total Users" || card.title === "Active Users" || card.title === "Withdrawals" || card.title === "Blogs") ? (
                                                <Spin size="small" />
                                            ) : (
                                                card.value
                                            )}
                                        </p>
                                    </div>
                                    <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                                        <card.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <span className="text-green-500 text-sm font-medium">{card.percentage}</span>
                                    <span className="text-gray-500 text-sm ml-2">from last month</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Withdrawal Amounts by Month</h3>
                            <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-600">
                                {lineChartData.length > 0 ? `Last ${lineChartData.length} Months` : "No Data"}
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={lineChartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                                    <YAxis tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                                    <Tooltip
                                        formatter={(value) => [`$${value}`, "Amount"]}
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ stroke: "#8b5cf6", strokeWidth: 2, r: 4, fill: "#fff" }}
                                        activeDot={{ stroke: "#8b5cf6", strokeWidth: 2, r: 6, fill: "#8b5cf6" }}
                                        fill="url(#colorSales)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">User Distribution</h3>
                            <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-600">
                                Current Period
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [name === "Blog Articles" ? `${value} articles` : `${value} users`, name]}
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-gray-700">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">User Management</h3>
                        <Select
                            style={{ width: 200 }}
                            placeholder="Filter by Role"
                            value={selectedRole === null ? "all" : selectedRole} // Sử dụng selectedRole làm giá trị hiện tại
                            onChange={(value) => filterUsersByRole(value === "all" ? null : Number(value))}
                        >
                            <Select.Option value="all">All Roles</Select.Option>
                            <Select.Option value={1}>Admin</Select.Option>
                            <Select.Option value={2}>Member</Select.Option>
                            <Select.Option value={3}>Therapist</Select.Option>
                        </Select>
                    </div>
                    {loading && !selectedUser ? (
                        <div className="flex justify-center py-4">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedUsers.map((user) => (
                                            <tr key={user.userId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {user.role === 1 ? "Admin" : user.role === 2 ? "Member" : "Therapist"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {user.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleUserClick(user)}
                                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                    >
                                                        View Withdrawals
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Pagination
                                    current={currentPage}
                                    total={filteredUsers.length}
                                    pageSize={pageSize}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </div>
                        </>
                    )}
                </div>

                <Modal
                    title={`Withdrawals for ${selectedUser?.fullName}`}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={1000}
                >
                    {loading && selectedUser ? (
                        <div className="flex justify-center py-4">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Withdraw ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedWithdrawals.map((withdrawal) => (
                                            <tr key={withdrawal.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${withdrawal.money.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusDisplay(withdrawal.status)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(withdrawal.updatedAt)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {withdrawal.status === 0 && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => updateWithdrawalStatus(withdrawal.id, 1)}
                                                                disabled={updatingWithdrawal === withdrawal.id}
                                                                className={`text-green-600 hover:text-green-900 text-sm font-medium ${updatingWithdrawal === withdrawal.id ? "opacity-50 cursor-not-allowed" : ""
                                                                    }`}
                                                            >
                                                                {updatingWithdrawal === withdrawal.id ? <Spin size="small" /> : "Accept"}
                                                            </button>
                                                            <button
                                                                onClick={() => updateWithdrawalStatus(withdrawal.id, 2)}
                                                                disabled={updatingWithdrawal === withdrawal.id}
                                                                className={`text-red-600 hover:text-red-900 text-sm font-medium ${updatingWithdrawal === withdrawal.id ? "opacity-50 cursor-not-allowed" : ""
                                                                    }`}
                                                            >
                                                                {updatingWithdrawal === withdrawal.id ? <Spin size="small" /> : "Reject"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {withdrawals.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No withdrawals found for this user
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {withdrawals.length > 0 && (
                                <div className="mt-4 flex justify-end">
                                    <Pagination
                                        current={withdrawalsPage}
                                        total={withdrawals.length}
                                        pageSize={withdrawalsPageSize}
                                        onChange={(page) => setWithdrawalsPage(page)}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default Dashboard;