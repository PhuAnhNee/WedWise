import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, message, Spin, Modal, Select } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Feedback {
    feedbackId: string;
    bookingId: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

interface Booking {
    bookingId: string;
    memberId: string;
    therapistId: string;
    scheduleId: string;
    status: number;
}

interface EnhancedFeedback extends Feedback {
    memberId?: string;
    therapistId?: string;
    status?: number;
}

const FeedbackManagement: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<EnhancedFeedback[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedFeedback, setSelectedFeedback] = useState<EnhancedFeedback | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const getAuthHeaders = (): Record<string, string> => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            throw new Error("No access token found. Please login again.");
        }
        return {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
        };
    };

    const fetchBookingById = async (bookingId: string): Promise<Booking | null> => {
        try {
            const response = await axios.get<Booking[]>(
                `${API_BASE_URL}/Booking/Get_Booking_By_Id?id=${bookingId}`,
                { headers: getAuthHeaders() }
            );
            return response.data[0]; // API trả về mảng, lấy phần tử đầu tiên
        } catch (error: unknown) {
            console.error(`Error fetching booking ${bookingId}:`, error);
            return null;
        }
    };

    const fetchAllFeedbacks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get<Feedback[]>(
                `${API_BASE_URL}/Feedback/Get_All_Feedbacks`,
                { headers: getAuthHeaders() }
            );
            const feedbackData = response.data;

            // Lấy thông tin booking cho từng feedback
            const enhancedFeedbacks = await Promise.all(
                feedbackData.map(async (feedback) => {
                    const booking = await fetchBookingById(feedback.bookingId);
                    return {
                        ...feedback,
                        memberId: booking?.memberId,
                        therapistId: booking?.therapistId,
                        status: booking?.status,
                    };
                })
            );

            setFeedbacks(enhancedFeedbacks);
        } catch (error: unknown) {
            console.error("Error fetching all feedbacks:", error);
            message.error("Failed to load feedbacks!");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFeedbacksByUserId = useCallback(async (userId: string) => {
        try {
            setLoading(true);
            const response = await axios.get<Feedback[]>(
                `${API_BASE_URL}/Feedback/Get_Feedback_By_User_Id?id=${userId}`,
                { headers: getAuthHeaders() }
            );
            const feedbackData = response.data;

            // Lấy thông tin booking cho từng feedback
            const enhancedFeedbacks = await Promise.all(
                feedbackData.map(async (feedback) => {
                    const booking = await fetchBookingById(feedback.bookingId);
                    return {
                        ...feedback,
                        memberId: booking?.memberId,
                        therapistId: booking?.therapistId,
                        status: booking?.status,
                    };
                })
            );

            setFeedbacks(enhancedFeedbacks);
        } catch (error: unknown) {
            console.error("Error fetching feedbacks by user:", error);
            message.error("Failed to load user feedbacks!");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fixed closeBooking function to address the 400 error
    const closeBooking = async (bookingId: string): Promise<void> => {
        try {
            setLoading(true);

            // Send the ID in the request body instead of as a query parameter
            const response = await axios.post(
                `${API_BASE_URL}/Booking/Close_Booking`,
                { id: bookingId },
                { headers: getAuthHeaders() }
            );

            if (response.status === 200) {
                message.success("Booking closed successfully!");
                if (selectedUserId) {
                    await fetchFeedbacksByUserId(selectedUserId);
                } else {
                    await fetchAllFeedbacks();
                }
            }
        } catch (error: unknown) {
            console.error("Error closing booking:", error);

            // Enhanced error logging to provide more details
            if (axios.isAxiosError(error) && error.response) {
                console.error("API Error Response:", error.response.data);
                message.error(`Failed to close booking: ${error.response.data?.message || 'Server returned an error'}`);
            } else {
                message.error("Failed to close booking!");
            }
        } finally {
            setLoading(false);
            setSelectedFeedback(null);
        }
    };

    useEffect(() => {
        fetchAllFeedbacks();
    }, [fetchAllFeedbacks]);

    const handleUserChange = (value: string | undefined) => {
        const userId = value || null;
        setSelectedUserId(userId);
        if (userId) {
            void fetchFeedbacksByUserId(userId);
        } else {
            void fetchAllFeedbacks();
        }
    };

    const columns = [
        {
            title: "Booking Reference",
            dataIndex: "bookingId",
            key: "bookingId",
            width: "20%",
            render: (id: string) => id.split("-")[0],
        },
        {
            title: "Member",
            key: "member",
            render: (_: unknown, record: EnhancedFeedback) =>
                record.memberId ? `User ${record.memberId.slice(0, 8)}` : "Unknown",
        },
        {
            title: "Therapist",
            key: "therapist",
            render: (_: unknown, record: EnhancedFeedback) =>
                record.therapistId ? `Therapist ${record.therapistId.slice(0, 8)}` : "Unknown",
        },
        {
            title: "Feedback",
            key: "feedback",
            render: (_: unknown, record: EnhancedFeedback) => (
                <div>
                    <span className="text-blue-500">Rating: {record.rating}/5</span>
                    {record.comment && <p className="text-gray-600">"{record.comment}"</p>}
                </div>
            ),
        },
        {
            title: "Status",
            key: "status",
            render: (_: unknown, record: EnhancedFeedback) => {
                const isClosed = record.status === 4;
                const isProcessing = !isClosed && record.status !== 3;

                if (isClosed) {
                    return <span className="text-green-500">Closed</span>;
                }
                if (isProcessing) {
                    return <span className="text-yellow-500">Processing</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-blue-500">Completed</span>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => setSelectedFeedback(record)}
                            className="bg-blue-500 hover:bg-blue-600"
                            size="small"
                        >
                            Close
                        </Button>
                    </div>
                );
            },
        },
    ];

    const uniqueMemberIds = Array.from(new Set(feedbacks.map((feedback) => feedback.memberId || "")));

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Feedback Management</h2>
                <Select
                    style={{ width: 200 }}
                    placeholder="Filter by User"
                    onChange={handleUserChange}
                    allowClear
                    value={selectedUserId}
                >
                    {uniqueMemberIds.map((memberId) => (
                        <Option key={memberId} value={memberId}>
                            {memberId.slice(0, 8)}
                        </Option>
                    ))}
                </Select>
            </div>

            <Spin spinning={loading}>
                <Table
                    dataSource={feedbacks}
                    columns={columns}
                    rowKey="feedbackId"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                    }}
                    className="shadow-md rounded-lg"
                />
            </Spin>

            <Modal
                title="Confirm Close Booking"
                open={!!selectedFeedback}
                onOk={() => {
                    if (selectedFeedback) {
                        void closeBooking(selectedFeedback.bookingId);
                    }
                }}
                onCancel={() => setSelectedFeedback(null)}
                okText="Confirm"
                cancelText="Cancel"
                confirmLoading={loading}
                okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
            >
                <p>Bạn có chắc chắn muốn đóng booking này không?</p>
                {selectedFeedback && (
                    <div>
                        <p>Booking Reference: {selectedFeedback.bookingId.split("-")[0]}</p>
                        <p>Member: {selectedFeedback.memberId?.slice(0, 8) || "Unknown"}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FeedbackManagement;