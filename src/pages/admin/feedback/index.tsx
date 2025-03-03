import React, { useEffect, useState } from "react";
import { Table, Pagination, message, Rate, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Feedback {
    feedbackId: string;
    bookingId: string;
    rating: number;
    feedbackTitle: string;
    feedbackContent: string;
    isSatisfied: boolean;
}

const FeedbackDisplay: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Fetch danh sách feedback từ API
    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get<Feedback[]>(`${API_BASE_URL}/Feedback/Get_All_Feedbacks`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Thêm token xác thực
                },
            });
            console.log("Feedbacks from API:", response.data);
            setFeedbacks(
                response.data.map((feedback) => ({
                    ...feedback,
                    key: feedback.feedbackId, // Gán key cho Table
                }))
            );
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching feedbacks:", err.response?.data || err.message);
            message.error("Failed to load feedbacks!");
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Cột bảng
    const columns: ColumnsType<Feedback> = [
        {
            title: "Booking ID",
            dataIndex: "bookingId",
            key: "bookingId",
        },
        {
            title: "Title",
            dataIndex: "feedbackTitle",
            key: "feedbackTitle",
        },
        {
            title: "Content",
            dataIndex: "feedbackContent",
            key: "feedbackContent",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating: number) => (
                <Rate disabled defaultValue={rating} count={5} /> // Hiển thị sao theo rating
            ),
        },
        {
            title: "Satisfied",
            dataIndex: "isSatisfied",
            key: "isSatisfied",
            render: (isSatisfied: boolean) => (
                <Tag color={isSatisfied ? "green" : "red"}>{isSatisfied ? "Yes" : "No"}</Tag>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Feedback Display</h2>
            <Table
                columns={columns}
                dataSource={feedbacks.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                pagination={false}
                bordered
            />
            <div className="flex justify-between items-center mt-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={feedbacks.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

export default FeedbackDisplay;