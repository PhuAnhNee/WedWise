import React from "react";
import { Table, Card, Statistic, Row, Col, Tag } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ColumnsType } from "antd/es/table";

interface SalesData {
    key: string;
    id: string;
    date: string;
    revenue: number;
    status: "Completed" | "Pending" | "Cancelled";
}

const salesData: SalesData[] = [
    { key: "1", id: "#10234", date: "Feb 1, 2024", revenue: 5000, status: "Completed" },
    { key: "2", id: "#10235", date: "Feb 2, 2024", revenue: 3200, status: "Completed" },
    { key: "3", id: "#10236", date: "Feb 3, 2024", revenue: 4500, status: "Pending" },
    { key: "4", id: "#10237", date: "Feb 4, 2024", revenue: 1200, status: "Cancelled" },
    { key: "5", id: "#10238", date: "Feb 5, 2024", revenue: 6100, status: "Completed" },
];

const chartData = [
    { name: "Mon", sales: 3000 },
    { name: "Tue", sales: 4500 },
    { name: "Wed", sales: 3200 },
    { name: "Thu", sales: 6100 },
    { name: "Fri", sales: 4200 },
    { name: "Sat", sales: 5200 },
    { name: "Sun", sales: 4800 },
];

const SalesReport: React.FC = () => {
    const columns: ColumnsType<SalesData> = [
        { title: "Order ID", dataIndex: "id", key: "id" },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Revenue ($)", dataIndex: "revenue", key: "revenue" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = status === "Completed" ? "green" : status === "Pending" ? "blue" : "red";
                return <Tag color={color}>{status}</Tag>;
            },
        },
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Sales Report</h2>

            {/* Summary Cards */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card bordered>
                        <Statistic title="Total Sales" value={24500} prefix="$" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered>
                        <Statistic title="Orders Completed" value={3} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered>
                        <Statistic title="Pending Orders" value={1} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered>
                        <Statistic title="Cancelled Orders" value={1} />
                    </Card>
                </Col>
            </Row>

            {/* Sales Chart */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Sales Trend (Weekly)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Sales Table */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
                <Table columns={columns} dataSource={salesData} pagination={{ pageSize: 5 }} />
            </Card>
        </div>
    );
};

export default SalesReport;
