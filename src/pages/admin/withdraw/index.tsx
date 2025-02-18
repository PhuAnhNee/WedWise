import React, { useState } from "react";
import { Table, Button, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";

interface WithdrawRequest {
    key: string;
    id: string;
    date: string;
    amount: number;
    therapist: string;
    status: "Pending" | "Rejected" | "Success";
}

const data: WithdrawRequest[] = [
    { key: "1", id: "#15267", date: "Mar 1, 2023", amount: 100, therapist: "Therapist Name", status: "Pending" },
    { key: "2", id: "#153587", date: "Jan 26, 2023", amount: 300, therapist: "Therapist Name", status: "Pending" },
    { key: "3", id: "#12436", date: "Feb 12, 2033", amount: 100, therapist: "Therapist Name", status: "Pending" },
    { key: "4", id: "#16879", date: "Feb 12, 2033", amount: 500, therapist: "Therapist Name", status: "Pending" },
    { key: "5", id: "#16378", date: "Feb 28, 2033", amount: 500, therapist: "Therapist Name", status: "Rejected" },
    { key: "6", id: "#16609", date: "March 13, 2033", amount: 100, therapist: "Therapist Name", status: "Success" },
    { key: "7", id: "#16907", date: "March 18, 2033", amount: 100, therapist: "Therapist Name", status: "Success" },
];

const WithdrawRequests: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const columns: ColumnsType<WithdrawRequest> = [
        { title: "Withdraw ID", dataIndex: "id", key: "id" },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Amount", dataIndex: "amount", key: "amount" },
        { title: "Therapist", dataIndex: "therapist", key: "therapist" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = status === "Pending" ? "blue" : status === "Rejected" ? "red" : "green";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button type="primary" size="small" disabled={record.status === "Success" || record.status === "Rejected"}>
                        Accept
                    </Button>
                    <Button type="primary" danger size="small" disabled={record.status === "Success"}>
                        Decline
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Withdraw Requests</h2>
            <Table
                columns={columns}
                dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                pagination={false}
                bordered
            />
            <div className="flex justify-between items-center mt-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={data.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

export default WithdrawRequests;
