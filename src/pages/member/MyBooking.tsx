import React, { useState, useEffect } from "react";
import { Modal, Button, notification, Form, Input, Rate, Radio, Space, Alert } from "antd";
import axios from "axios";
import AuthService from "../service/AuthService";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

// Define interfaces for our data structures
interface Booking {
  bookingId: string;
  memberId: string;
  therapistId: string;
  therapistName: string;
  scheduleId: string;
  status: number;
  bookingDate: string;
  createdAt: string;
  notes?: string;
  hasFeedback?: boolean;
  // Add these new properties
  feedback?: Feedback;
  schedule?: Schedule;
  therapist?: Therapist;
}

// Interface for Feedback
interface Feedback {
  feedbackId: string;
  bookingId: string;
  rating: number;
  feedbackTitle: string;
  feedbackContent: string;
  isSatisfied: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdUser?: any;
  updatedUser?: any;
  booking?: any;
}

// Interface for Schedule
interface Schedule {
  scheduleId: string;
  therapistId: string;
  date: string;
  slot: number;
  isAvailable: boolean;
  therapist?: any;
  bookings?: any;
}

// Interface for Therapist
interface Therapist {
  therapistId: string;
  therapistName: string;
  avatar: string;
  status: boolean;
  description: string;
  consultationFee: number;
  meetUrl: string;
  schedules?: any[];
  specialty?: any;
  certificates?: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  createdUser?: any;
  updatedUser?: any;
}

// Keep your existing FeedbackData interface for submitting feedback
interface FeedbackData {
  bookingId: string;
  rating: number;
  feedbackTitle: string;
  feedbackContent: string;
  isSatisfied: boolean;
}

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackForm] = Form.useForm();
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState<boolean>(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState<boolean>(false);
  const [isEligibleForRefund, setIsEligibleForRefund] = useState<boolean>(false);

  // Tạo notification
  const [api, contextHolder] = notification.useNotification();

  // Hàm hiển thị thông báo thành công
  const showSuccessNotification = (message: string) => {
    api.success({
      message: "Thành công",
      description: message,
      icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
      placement: "topRight",
      duration: 3,
      style: {
        backgroundColor: "#f6ffed",
        border: "1px solid #b7eb8f",
      },
    });
  };

  // Hàm hiển thị thông báo lỗi
  const showErrorNotification = (errorMessage: string) => {
    api.error({
      message: "Lỗi",
      description: errorMessage,
      icon: <CloseCircleFilled style={{ color: "#ff4d4f" }} />,
      placement: "topRight",
      duration: 4,
      style: {
        backgroundColor: "#fff2f0",
        border: "1px solid #ffccc7",
      },
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Get the current user from AuthService
      const currentUser = AuthService.getCurrentUser();

      if (!currentUser || !currentUser.UserId) {
        showErrorNotification("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!");
        return;
      }

      const userId = currentUser.UserId;
      console.log("Fetching bookings for user ID:", userId);

      // Fetch bookings using the API endpoint with the user's ID
      const response = await axios.get(
        `${API_BASE_URL}/Booking/Get_Booking_By_User_Id?id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        }
      );

      if (response.data) {
        console.log("Bookings data retrieved:", response.data);

        // Ở đây có thể thêm logic để kiểm tra xem booking đã có feedback chưa
        // Ví dụ: gọi API kiểm tra feedback hoặc trường hợp API trả về thông tin hasFeedback
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
      showErrorNotification("Không thể lấy danh sách lịch hẹn. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // Get slot time based on slot number
  const getSlotStartTimeBySlot = (slot: number): Date | null => {
    if (!selectedBooking || !selectedBooking.schedule || !selectedBooking.schedule.date) {
      return null;
    }

    const appointmentDate = new Date(selectedBooking.schedule.date);
    let hours = 0;
    let minutes = 0;

    switch (slot) {
      case 1: hours = 7; minutes = 30; break;
      case 2: hours = 9; minutes = 30; break;
      case 3: hours = 11; minutes = 30; break;
      case 4: hours = 13; minutes = 30; break;
      case 5: hours = 15; minutes = 30; break;
      case 6: hours = 17; minutes = 30; break;
      case 7: hours = 19; minutes = 30; break;
      default: return null;
    }

    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate;
  };

  // Check if eligible for refund based on cancellation time
  const checkRefundEligibility = (): boolean => {
    if (!selectedBooking || !selectedBooking.schedule) {
      return false;
    }

    const slotStartTime = getSlotStartTimeBySlot(selectedBooking.schedule.slot);
    if (!slotStartTime) {
      return false;
    }

    const currentTime = new Date();
    const timeDifference = slotStartTime.getTime() - currentTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    // More than 2 hours before the appointment
    return hoursDifference > 2;
  };

  // Handle showing cancel confirmation
  const showCancelConfirmation = () => {
    if (!selectedBooking) {
      showErrorNotification("Không thể hủy lịch hẹn: Thông tin lịch hẹn không có sẵn");
      return;
    }

    const isEligible = checkRefundEligibility();
    setIsEligibleForRefund(isEligible);
    setIsCancelModalVisible(true);
    setIsModalVisible(false); // Hide the booking details modal
  };

 // Handle canceling a booking
const handleCancelBooking = async () => {
  if (!selectedBooking) {
    showErrorNotification("Không thể hủy lịch hẹn: Thông tin lịch hẹn không có sẵn");
    return;
  }

  if (!selectedBooking.bookingId) {
    showErrorNotification("Không thể hủy lịch hẹn: ID lịch hẹn không hợp lệ");
    return;
  }

  try {
    console.log("Cancelling booking with ID:", selectedBooking.bookingId);
    
    // Xác định trạng thái hoàn tiền dựa trên thời gian hủy
    const isEligibleForRefund = checkRefundEligibility();
    
    // Chuẩn bị dữ liệu gửi đi theo định dạng mới
    const cancelData = {
      bookingId: selectedBooking.bookingId,
      isReturn: isEligibleForRefund
    };

    // Call the cancel booking API với dữ liệu mới
    await axios.post(
      `${API_BASE_URL}/Booking/Cancel_Booking`,
      cancelData,
      {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const refundMessage = isEligibleForRefund 
      ? "Lịch hẹn đã được hủy thành công! Tiền sẽ được hoàn về ví của bạn."
      : "Lịch hẹn đã được hủy thành công! Tiền sẽ không được hoàn lại do hủy lịch hẹn trong vòng 2 giờ trước khi bắt đầu.";
    
    showSuccessNotification(refundMessage);
    window.location.reload();
    fetchBookings(); // Refresh the bookings list
  } catch (error) {
    console.error("Lỗi khi hủy lịch hẹn:", error);
    showErrorNotification("Hủy lịch hẹn thất bại. Vui lòng thử lại!");
  } finally {
    setIsCancelModalVisible(false);
    setSelectedBooking(null);
  }
};
// Thêm hàm này trong component MyBooking
const getMeetingStatus = (booking: Booking) => {
  if (!booking.schedule || !booking.schedule.date || !booking.schedule.slot) {
    return "Không có thông tin";
  }

  const slotStartTime = getSlotStartTimeBySlot(booking.schedule.slot);
  if (!slotStartTime) {
    return "Không có thông tin";
  }

  const currentTime = new Date();
  const slotEndTime = new Date(slotStartTime);
  slotEndTime.setHours(slotEndTime.getHours() + 1, slotEndTime.getMinutes() + 30); // Cuộc hẹn kéo dài 1h30

  if (currentTime < slotStartTime) {
    return "Chưa đến giờ";
  } else if (currentTime >= slotStartTime && currentTime <= slotEndTime) {
    return "Đúng giờ";
  } else {
    return "Cuộc hẹn đã kết thúc";
  }
};

  // Handle submitting feedback
  const handleSubmitFeedback = async (values: any) => {
    if (!selectedBooking || !selectedBooking.bookingId) {
      showErrorNotification("Không thể gửi đánh giá: Thông tin lịch hẹn không hợp lệ");
      return;
    }

    setIsSubmittingFeedback(true);

    const feedbackData: FeedbackData = {
      bookingId: selectedBooking.bookingId,
      rating: values.rating,
      feedbackTitle: values.feedbackTitle,
      feedbackContent: values.feedbackContent,
      isSatisfied: values.isSatisfied
    };

    try {
      console.log("Submitting feedback:", feedbackData);

      // Call the create feedback API
      await axios.post(
        `${API_BASE_URL}/Feedback/Create_Feedback`,
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showSuccessNotification("Đánh giá của bạn đã được gửi thành công!");

      // Update the local booking data to reflect that this booking now has feedback
      if (selectedBooking) {
        const updatedBookings = bookings.map(booking =>
          booking.bookingId === selectedBooking.bookingId
            ? { ...booking, hasFeedback: true }
            : booking
        );
        setBookings(updatedBookings);
      }

      // Close the feedback modal
      setIsFeedbackModalVisible(false);

      // Reset the form
      feedbackForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      showErrorNotification("Gửi đánh giá thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Open feedback modal
  const openFeedbackModal = () => {
    setIsFeedbackModalVisible(true);
    setIsModalVisible(false); // Hide the booking details modal
  };

  // Add this function to get the time range based on slot number
  const getTimeRangeBySlot = (slot: number) => {
    switch (slot) {
      case 1: return "7:30 - 9:00";
      case 2: return "9:30 - 11:00";
      case 3: return "11:30 - 13:00";
      case 4: return "13:30 - 15:00";
      case 5: return "15:30 - 17:00";
      case 6: return "17:30 - 19:00";
      case 7: return "19:30 - 21:00";
      default: return `Slot ${slot}`;
    }
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status text based on the status code
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Đang chờ xác nhận", color: "text-yellow-500" };
      case 1:
        return { text: "Đã xác nhận", color: "text-green-500" };
      case 2:
        return { text: "Đã hủy", color: "text-red-500" };
      case 3:
        return { text: "Đã hoàn thành", color: "text-blue-500" };
      case 4:
        return { text: "Đã đóng", color: "text-gray-500" };
      default:
        return { text: "Không xác định", color: "text-gray-500" };
    }
  };

  return (
    <>{contextHolder}
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Lịch hẹn của tôi</h1>

        {loading ? (
          <p className="text-center">Đang tải dữ liệu...</p>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const statusInfo = getStatusText(booking.status);

              return (
                <div
                  key={booking.bookingId}
                  className="p-4 border rounded-lg shadow-lg bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    console.log("Selected booking:", booking);
                    setSelectedBooking(booking);
                    setIsModalVisible(true);
                  }}
                >
                  {/* Display therapist avatar */}
                  {booking.therapist && booking.therapist.avatar && (
                    <div className="mb-3">
                      <img
                        src={booking.therapist.avatar}
                        alt={booking.therapist.therapistName || "Therapist"}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}

                  {/* Display therapist name */}
                  <h3 className="text-lg font-semibold">
                    {booking.therapist ? booking.therapist.therapistName || "Chuyên gia tư vấn" : booking.therapistName}
                  </h3>

                  <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>

                  {/* Display schedule date instead of booking date */}
                  <p className="text-gray-600">
                    <span className="font-medium">Ngày hẹn:</span> {
                      booking.schedule && booking.schedule.date
                        ? formatDate(booking.schedule.date)
                        : formatDate(booking.bookingDate)
                    }
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Giờ hẹn:</span> {
                      booking.schedule && booking.schedule.slot
                        ? getTimeRangeBySlot(booking.schedule.slot)
                        : "Không có thông tin"
                    }
                  </p>

                  {booking.status === 3 && (booking.hasFeedback || booking.feedback) && (
                    <div className="mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Đã đánh giá</span>
                    </div>
                  )}

                  <div className="mt-4 text-right">
                    <span className="text-sm text-gray-500">Nhấn để xem chi tiết</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center bg-gray-50 p-8 rounded-lg">
            <p className="text-gray-500 mb-2">Bạn chưa có lịch hẹn nào.</p>
            <p className="text-gray-500">Hãy đặt lịch hẹn với chuyên gia tư vấn ngay!</p>
          </div>
        )}

        {/* Booking details modal */}
        <Modal
          title="Chi tiết lịch hẹn"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setSelectedBooking(null);
          }}
          footer={selectedBooking ? (
            <div>
              <Button key="back" onClick={() => setIsModalVisible(false)}>
                Đóng
              </Button>
              {(selectedBooking.status === 0 || selectedBooking.status === 1) && (
                <Button
                  key="cancel"
                  danger
                  onClick={showCancelConfirmation}
                >
                  Hủy lịch hẹn
                </Button>
              )}
              {selectedBooking.status === 3 && !selectedBooking.hasFeedback && (
                <Button
                  key="feedback"
                  type="primary"
                  onClick={openFeedbackModal}
                >
                  Gửi đánh giá
                </Button>
              )}
            </div>
          ) : null}
        >
          {selectedBooking && (
            <div className="space-y-3">
              <div className="border-b pb-2 flex items-center gap-3">
                {/* Show therapist avatar in the modal */}
                {selectedBooking.therapist && selectedBooking.therapist.avatar && (
                  <img
                    src={selectedBooking.therapist.avatar}
                    alt={selectedBooking.therapist.therapistName || "Therapist"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  {/* Display therapist name from therapist object if available */}
                  <p className="text-lg font-semibold">
                    {selectedBooking.therapist ? selectedBooking.therapist.therapistName || "Chuyên gia tư vấn" : selectedBooking.therapistName}
                  </p>
                  <p className={`font-medium ${getStatusText(selectedBooking.status).color}`}>
                    {getStatusText(selectedBooking.status).text}
                  </p>
                </div>
              </div>

              <p>
                <span className="font-medium">Ngày hẹn:</span> {
                  selectedBooking.schedule && selectedBooking.schedule.date
                    ? formatDate(selectedBooking.schedule.date)
                    : formatDate(selectedBooking.bookingDate)
                }
              </p>
              <p>
                <span className="font-medium">Giờ hẹn:</span> {
                  selectedBooking.schedule && selectedBooking.schedule.slot
                    ? getTimeRangeBySlot(selectedBooking.schedule.slot)
                    : "Không có thông tin"
                }
              </p>

              {/* Add meet URL if available */}
              {selectedBooking.therapist && selectedBooking.therapist.meetUrl && (
      <p>
        <span className="font-medium">Link cuộc hẹn:</span>{" "}
        {(() => {
          const status = getMeetingStatus(selectedBooking);
          if (status === "Đúng giờ") {
            return (
              <a
                href={selectedBooking.therapist.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Tham gia cuộc hẹn
              </a>
            );
          } else if (status === "Chưa đến giờ") {
            return <span className="text-gray-500 ml-1">Chưa đến giờ</span>;
          } else {
            return <span className="text-gray-500 ml-1">Cuộc hẹn đã kết thúc</span>;
          }
        })()}
      </p>
    )}

              {selectedBooking.notes && (
                <div className="mt-4">
                  <p className="font-medium">Ghi chú:</p>
                  <p className="bg-gray-50 p-3 rounded">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.status === 0 && (
                <div className="bg-yellow-50 p-3 rounded mt-4">
                  <p className="text-sm">Lịch hẹn của bạn đang chờ xác nhận từ chuyên gia tư vấn. Bạn có thể hủy lịch hẹn này nếu cần.</p>
                </div>
              )}

              {selectedBooking.status === 1 && (
                <div className="bg-green-50 p-3 rounded mt-4">
                  <p className="text-sm">Lịch hẹn đã được xác nhận. Vui lòng tham gia đúng giờ. Nếu cần hủy, vui lòng thực hiện trước thời gian hẹn.</p>
                </div>
              )}

              {selectedBooking.status === 3 && !selectedBooking.hasFeedback && (
                <div className="bg-blue-50 p-3 rounded mt-4">
                  <p className="text-sm">Lịch hẹn đã hoàn thành. Bạn có thể gửi đánh giá về buổi tư vấn này.</p>
                </div>
              )}

              {selectedBooking.status === 3 && selectedBooking.hasFeedback && (
                <div className="bg-blue-50 p-3 rounded mt-4">
                  <p className="text-sm">Bạn đã đánh giá về buổi tư vấn này. Cảm ơn bạn đã gửi phản hồi!</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          title="Xác nhận hủy lịch hẹn"
          open={isCancelModalVisible}
          onCancel={() => {
            setIsCancelModalVisible(false);
            setIsModalVisible(true); // Show the booking details modal again
          }}
          footer={[
            <Button key="back" onClick={() => {
              setIsCancelModalVisible(false);
              setIsModalVisible(true);
            }}>
              Quay lại
            </Button>,
            <Button
              key="submit"
              danger
              onClick={handleCancelBooking}
            >
              Xác nhận hủy
            </Button>,
          ]}
        >
          {selectedBooking && (
            <div>
              <Alert
                message={isEligibleForRefund 
                  ? "Hoàn tiền vào ví" 
                  : "Không hoàn tiền"}
                description={isEligibleForRefund 
                  ? "Bạn đang hủy lịch hẹn trước thời gian bắt đầu hơn 2 tiếng. Tiền sẽ được hoàn trả vào ví của bạn." 
                  : "Bạn đang hủy lịch hẹn trong vòng 2 tiếng trước khi bắt đầu. Tiền sẽ KHÔNG được hoàn trả vào ví của bạn."}
                type={isEligibleForRefund ? "success" : "warning"}
                showIcon
                style={{marginBottom: "20px"}}
              />
              <p>Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
              <div className="bg-gray-50 p-3 rounded mt-4">
                <p><span className="font-medium">Chuyên gia tư vấn:</span> {selectedBooking.therapist ? selectedBooking.therapist.therapistName : selectedBooking.therapistName}</p>
                <p><span className="font-medium">Ngày hẹn:</span> {
                  selectedBooking.schedule && selectedBooking.schedule.date
                    ? formatDate(selectedBooking.schedule.date)
                    : formatDate(selectedBooking.bookingDate)
                }</p>
                <p><span className="font-medium">Giờ hẹn:</span> {
                  selectedBooking.schedule && selectedBooking.schedule.slot
                    ? getTimeRangeBySlot(selectedBooking.schedule.slot)
                    : "Không có thông tin"
                }</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Feedback modal */}
        <Modal
          title="Đánh giá buổi tư vấn"
          open={isFeedbackModalVisible}
          onCancel={() => {
            setIsFeedbackModalVisible(false);
            setIsModalVisible(true); // Show the booking details modal again
          }}
          footer={[
            <Button key="back" onClick={() => {
              setIsFeedbackModalVisible(false);
              setIsModalVisible(true);
            }}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isSubmittingFeedback}
              onClick={() => feedbackForm.submit()}
            >
              Gửi đánh giá
            </Button>,
          ]}
        >
          {selectedBooking && (
            <Form
              form={feedbackForm}
              layout="vertical"
              onFinish={handleSubmitFeedback}
              initialValues={{
                isSatisfied: true,
                rating: 5
              }}
            >
              <Form.Item
                label="Mức độ hài lòng"
                name="isSatisfied"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ hài lòng' }]}
              >
                <Radio.Group>
                  <Space>
                    <Radio value={true}>Hài lòng</Radio>
                    <Radio value={false}>Không hài lòng</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Đánh giá (1-5 sao)"
                name="rating"
                rules={[{ required: true, message: 'Vui lòng đánh giá số sao' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Tiêu đề đánh giá"
                name="feedbackTitle"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề đánh giá' }]}
              >
                <Input placeholder="Nhập tiêu đề ngắn gọn về trải nghiệm của bạn" />
              </Form.Item>

              <Form.Item
                label="Nội dung đánh giá"
                name="feedbackContent"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Mô tả chi tiết trải nghiệm tư vấn của bạn, điều bạn thích hoặc không thích"
                />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </>
  );
};

export default MyBooking;