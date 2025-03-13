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

interface Booking {
    bookingId: string;
    memberId: string;
    therapistId: string;
    scheduleId: string;
    status: number;
}

interface Therapist {
    therapistId: string;
    therapistName: string;
}

const FeedbackDisplay: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [therapistNames, setTherapistNames] = useState<Record<string, string>>({}); // Lưu therapistName theo bookingId
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Fetch danh sách feedback từ API
    const fetchFeedbacks = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const response = await axios.get<Feedback[]>(`${API_BASE_URL}/Feedback/Get_All_Feedbacks`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("Feedbacks from API:", response.data);

            const feedbacksWithKeys = response.data.map((feedback) => ({
                ...feedback,
                key: feedback.feedbackId,
            }));
            setFeedbacks(feedbacksWithKeys);

            // Fetch therapist names cho từng feedback
            const therapistMap: Record<string, string> = {};
            await Promise.all(
                feedbacksWithKeys.map(async (feedback) => {
                    try {
                        // Gọi API Booking để lấy therapistId
                        const bookingResponse = await axios.get<Booking[]>(
                            `${API_BASE_URL}/Booking/Get_Booking_By_Id?id=${feedback.bookingId}`,
                            { headers: { Authorization: `Bearer ${accessToken}` } }
                        );
                        console.log(`Booking for ${feedback.bookingId}:`, bookingResponse.data);
                        const booking = bookingResponse.data[0]; // Lấy booking đầu tiên (API trả về mảng)
                        if (booking?.therapistId) {
                            // Gọi API Therapist để lấy therapistName
                            const therapistResponse = await axios.get<Therapist>(
                                `${API_BASE_URL}/Therapist/Get_Therapist_By_Id?id=${booking.therapistId}`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            );
                            console.log(`Therapist for ${booking.therapistId}:`, therapistResponse.data);
                            therapistMap[feedback.bookingId] = therapistResponse.data.therapistName || "Unknown";
                        } else {
                            therapistMap[feedback.bookingId] = "Unknown";
                        }
                    } catch (error) {
                        console.error(`Error fetching details for booking ${feedback.bookingId}:`, error);
                        therapistMap[feedback.bookingId] = "Unknown";
                    }
                })
            );
            setTherapistNames(therapistMap);
        } catch (error) {
            const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            console.error("Error fetching feedbacks:", err.response?.data || err.message);
            const errorMessage =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                        .flat()
                        .join(", ")
                    : "Failed to load feedbacks!");
            message.error(errorMessage);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Cột bảng
    const columns: ColumnsType<Feedback> = [
        {
            title: "Therapist Name",
            dataIndex: "bookingId",
            key: "therapistName",
            render: (bookingId: string) => (
                <span className="text-gray-800">{therapistNames[bookingId] || "Loading..."}</span>
            ),
        },
        {
            title: "Title",
            dataIndex: "feedbackTitle",
            key: "feedbackTitle",
            render: (text: string) => <span className="font-medium text-gray-800">{text}</span>,
        },
        {
            title: "Content",
            dataIndex: "feedbackContent",
            key: "feedbackContent",
            render: (text: string) => <span className="text-gray-600">{text}</span>,
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating: number) => (
                <Rate disabled defaultValue={rating} count={5} className="text-yellow-500" />
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
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Feedback Display</h2>
                <Table
                    columns={columns}
                    dataSource={feedbacks.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    pagination={false}
                    bordered
                    className="shadow-sm rounded-lg overflow-hidden"
                    rowClassName="hover:bg-gray-100"
                />
                <div className="flex justify-between items-center mt-6">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={feedbacks.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        className="text-gray-700"
                    />
                </div>
            </div>
        </div>
    );
};

export default FeedbackDisplay;