import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Pagination, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Therapist {
    therapistId: string;
    therapistName: string;
    avatar: string;
    status: boolean;
    description: string;
    consultationFee: number;
    meetUrl: string;
    schedules: {
        scheduleId: string;
        therapistId: string;
        date: string;
        slot: number;
        isAvailable: boolean;
    }[];
    specialty: string[];
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

const TherapistManagement: React.FC = () => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Fetch danh sách therapist từ API
    const fetchTherapists = async () => {
        try {
            const response = await axios.get<Therapist[]>(`${API_BASE_URL}/Therapist/Get_All_Therapists`);
            console.log("Therapists from API:", response.data);
            setTherapists(
                response.data.map((therapist) => ({
                    ...therapist,
                    key: therapist.therapistId, // Gán key cho Table
                }))
            );
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching therapists:", err.response?.data || err.message);
            message.error("Failed to load therapists!");
        }
    };

    // Xử lý Accept (set status thành true)
    const handleAccept = async (therapist: Therapist) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                therapistId: therapist.therapistId,
                avatar: therapist.avatar || "", // Giữ nguyên giá trị hiện tại
                status: true, // Chấp nhận therapist
                description: therapist.description || "No description", // Giữ nguyên giá trị hiện tại
                consultationFee: therapist.consultationFee || 0, // Giữ nguyên giá trị hiện tại
                meetUrl: therapist.meetUrl || "", // Giữ nguyên giá trị hiện tại
            };

            console.log("Accept Payload:", payload); // Log payload để debug
            const response = await axios.post(`${API_BASE_URL}/Therapist/Update_Therapist`, payload, { headers });
            console.log("Accept Therapist Response:", response.data);
            message.success("Therapist accepted successfully!");
            fetchTherapists(); // Cập nhật danh sách
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error accepting therapist:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to accept therapist!");
        }
    };

    // Xử lý Decline (set status thành false)
    const handleDecline = async (therapist: Therapist) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                therapistId: therapist.therapistId,
                avatar: therapist.avatar || "", // Giữ nguyên giá trị hiện tại
                status: false, // Từ chối therapist
                description: therapist.description || "No description", // Giữ nguyên giá trị hiện tại
                consultationFee: therapist.consultationFee || 0, // Giữ nguyên giá trị hiện tại
                meetUrl: therapist.meetUrl || "", // Giữ nguyên giá trị hiện tại
            };

            console.log("Decline Payload:", payload); // Log payload để debug
            const response = await axios.post(`${API_BASE_URL}/Therapist/Update_Therapist`, payload, { headers });
            console.log("Decline Therapist Response:", response.data);
            message.success("Therapist declined successfully!");
            fetchTherapists(); // Cập nhật danh sách
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error declining therapist:", err.response?.data || err.message);
            message.error(err.response?.data?.message || "Failed to decline therapist!");
        }
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    // Cột bảng
    const columns: ColumnsType<Therapist> = [
        { title: "Therapist Name", dataIndex: "therapistName", key: "therapistName" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: boolean) => {
                const color = status ? "green" : "red";
                return <Tag color={color}>{status ? "Active" : "Inactive"}</Tag>;
            },
        },
        { title: "Consultation Fee", dataIndex: "consultationFee", key: "consultationFee" },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        size="small"
                        disabled={record.status} // Disable nếu đã Active
                        onClick={() => handleAccept(record)}
                    >
                        Accept
                    </Button>
                    <Button
                        type="primary"
                        danger
                        size="small"
                        disabled={!record.status} // Disable nếu đã Inactive
                        onClick={() => handleDecline(record)}
                    >
                        Decline
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Therapist Management</h2>
            <Table
                columns={columns}
                dataSource={therapists.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                pagination={false}
                bordered
            />
            <div className="flex justify-between items-center mt-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={therapists.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

export default TherapistManagement;