import React from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";

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

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

const cardsData = [
    { title: "Revenue Stats", value: "$432", color: "bg-pink-500" },
    { title: "Page Views", value: "$432", color: "bg-purple-500" },
    { title: "New Users", value: "$432", color: "bg-blue-500" },
    { title: "Sales", value: "$432", color: "bg-yellow-500" },
];

const Dashboard: React.FC = () => {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Biểu đồ đường */}
                <div className="bg-white p-4 shadow-md rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineChartData}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} fill="url(#colorUv)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ tròn */}
                <div className="bg-white p-4 shadow-md rounded-lg relative">
                    <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {pieChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4 Khung Thống Kê */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                {cardsData.map((card, index) => (
                    <div key={index} className={`${card.color} p-4 rounded-lg shadow-md text-white`}>
                        <h4 className="text-lg font-semibold">{card.title}</h4>
                        <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
