import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, Eye, ShoppingCart } from "lucide-react";
import axios, { AxiosError } from "axios";
import { Spin, Modal, Pagination } from "antd";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface User {
    userId: string;
    fullName: string;
    isActive: boolean;
    email: string;
    bookings: string[];
}

interface Withdrawal {
    withdrawId?: string;
    userId: string;
    amount?: number;
    status?: string;
    date?: string;
}

const lineChartData = [
    { name: "Jan", value: 300 },
    { name: "Feb", value: 600 },
    { name: "Mar", value: 800 },
    { name: "Apr", value: 700 },
    { name: "May", value: 900 },
    { name: "Jun", value: 1100 },
    { name: "Jul", value: 1300 },
];

const pieChartData = [
    { name: "Direct", value: 33 },
    { name: "Organic", value: 55 },
    { name: "Referral", value: 12 },
];

const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4"];

const Dashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJiMmZiNjNkNS0xMTdhLTQxY2ItOTA3ZS1iYjAyYWRhYWQyZWUiLCJOYW1lIjoiYWRtaW4iLCJFbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsIlBob25lIjoiMTIzNDU2NzgiLCJSb2xlIjoiQURNSU4iLCJBdmF0YXIiOiJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3N0dWRlbnQtNTFlNmEuYXBwc3BvdC5jb20vby9pbWFnZXMlMkY2Mzg3NjU5OTQzNjE1MTU1NDVfYXZhdGFyLmpwZz9hbHQ9bWVkaWEmdG9rZW49OWIzYjlhZGQtNzZkYy00NzI5LTg0ZmEtZTQ5YjI2NWRlZjEyIiwiZXhwIjoxNzQxODc5MjY0LCJpc3MiOiJQcmUtbWFyaXRhbCBDb3Vuc2VsaW5nIFBsYXRmb3JtIiwiYXVkIjoiUHJlLW1hcml0YWwgQ291bnNlbGluZyBQbGF0Zm9ybSJ9.D_zEEAqe9b3RFVemCidtMAEkK6Jztop9Dj-okpmu4IA"}`,
        Accept: "*/*"
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get<User[]>(`${API_BASE_URL}/Account/Get_All_Users`, {
                headers: getHeaders()
            });
            setUsers(response.data);
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error fetching users:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawals = async (user: User) => {
        setLoading(true);
        try {
            const response = await axios.get<Withdrawal[]>(`${API_BASE_URL}/Withdraw/Get_Withdraw_By_UserId?id=${user.userId}`, {
                headers: getHeaders()
            });
            setWithdrawals(response.data);
            setSelectedUser(user);
            setModalVisible(true);
        } catch (error) {
            const err = error as AxiosError;
            console.error("Error fetching withdrawals:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUserClick = (user: User) => {
        fetchWithdrawals(user);
    };

    const cardsData = [
        { title: "Total Users", value: users.length.toString(), icon: Users, color: "from-violet-500 to-purple-600", percentage: "+0%" },
        { title: "Page Views", value: "48.2K", icon: Eye, color: "from-blue-500 to-indigo-600", percentage: "+8.1%" },
        { title: "Active Users", value: users.filter(u => u.isActive).length.toString(), icon: Users, color: "from-cyan-500 to-teal-600", percentage: "+4.3%" },
        { title: "Withdrawals", value: withdrawals.length.toString(), icon: ShoppingCart, color: "from-amber-500 to-orange-600", percentage: "+0%" },
    ];

    // Pagination logic
    const paginatedUsers = users.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1500px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
                    <div className="bg-white px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-600">
                        Last Updated: Today, 08:00 AM PDT
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cardsData.map((card, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {loading && (card.title === "Total Users" || card.title === "Active Users" || card.title === "Withdrawals")
                                                ? <Spin size="small" />
                                                : card.value}
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
                    {/* Line Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Sales Performance</h3>
                            <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-600">
                                Last 7 Months
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                                <YAxis tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#fff' }}
                                    activeDot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 6, fill: '#8b5cf6' }}
                                    fill="url(#colorSales)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Traffic Sources</h3>
                            <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-600">
                                Current Period
                            </div>
                        </div>
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
                                >
                                    {pieChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value}%`, "Percentage"]}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span className="text-gray-700">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Users Section with Pagination */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">User Management</h3>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedUsers.map((user) => (
                                            <tr key={user.userId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
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
                                    total={users.length}
                                    pageSize={pageSize}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Withdrawals Modal */}
                <Modal
                    title={`Withdrawals for ${selectedUser?.fullName}`}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    {loading && selectedUser ? (
                        <div className="flex justify-center py-4">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Withdraw ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {withdrawals.map((withdrawal, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.withdrawId || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.amount || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.status || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.date || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {withdrawals.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No withdrawals found for this user
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default Dashboard;