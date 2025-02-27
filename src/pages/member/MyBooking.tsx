import React, { useState, useEffect } from "react";
import { Modal, Button, notification  } from "antd";
import axios from "axios";
import AuthService from "../service/AuthService";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

// Define interfaces for our data structures
interface Booking {
  bookingId: string;  // Changed from id to bookingId
  memberId: string;   // Changed from userId
  therapistId: string;
  therapistName: string;
  scheduleId: string;
  status: number;
  bookingDate: string;
  createdAt: string;
  notes?: string;
}

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user's bookings when the component mounts
   // ✅ Tạo notification
   const [api, contextHolder] = notification.useNotification();

   // ✅ Hàm hiển thị thông báo thành công
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
 
   // ✅ Hàm hiển thị thông báo lỗi
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
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
      showErrorNotification("Không thể lấy danh sách lịch hẹn. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // Handle canceling a booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) {
      showErrorNotification("Không thể hủy lịch hẹn: Thông tin lịch hẹn không có sẵn");
      return;
    }

    if (!selectedBooking.bookingId) {  // Changed from id to bookingId
      showErrorNotification("Không thể hủy lịch hẹn: ID lịch hẹn không hợp lệ");
      return;
    }

    try {
      console.log("Cancelling booking with ID:", selectedBooking.bookingId);
      
      // Call the cancel booking API
      await axios.post(
        `${API_BASE_URL}/Booking/Cancel_Booking?id=${selectedBooking.bookingId}`,  // Using bookingId instead of id
        {},
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        }
      );
      
      showSuccessNotification("Lịch hẹn đã được hủy thành công!");
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Lỗi khi hủy lịch hẹn:", error);
      showErrorNotification("Hủy lịch hẹn thất bại. Vui lòng thử lại!");
    } finally {
      setIsModalVisible(false);
      setSelectedBooking(null);
    }
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
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
            // Only show cancel button for pending or confirmed bookings
            const canCancel = booking.status === 0 || booking.status === 1;
            
            return (
              <div 
                key={booking.bookingId}  // Changed from id to bookingId
                className="p-4 border rounded-lg shadow-lg bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  console.log("Selected booking:", booking);
                  setSelectedBooking(booking);
                  setIsModalVisible(true);
                }}
              >
                <h3 className="text-lg font-semibold">{booking.therapistName}</h3>
                <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
                <p className="text-gray-600">
                  <span className="font-medium">Ngày hẹn:</span> {formatDate(booking.bookingDate)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Ngày tạo:</span> {formatDate(booking.createdAt)}
                </p>
                
                {canCancel && (
                  <div className="mt-4 text-right">
                    <span className="text-sm text-gray-500">Nhấn để xem chi tiết</span>
                  </div>
                )}
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
        footer={selectedBooking && (selectedBooking.status === 0 || selectedBooking.status === 1) ? [
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="cancel" 
            danger 
            onClick={() => {
              console.log("Cancel button clicked for booking:", selectedBooking);
              handleCancelBooking();
            }}
          >
            Hủy lịch hẹn
          </Button>,
        ] : [
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedBooking && (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <p className="text-lg font-semibold">{selectedBooking.therapistName}</p>
              <p className={`font-medium ${getStatusText(selectedBooking.status).color}`}>
                {getStatusText(selectedBooking.status).text}
              </p>
            </div>
            
            <p>
              <span className="font-medium">Mã đặt lịch:</span> {selectedBooking.bookingId}
            </p>
            <p>
              <span className="font-medium">Ngày giờ hẹn:</span> {formatDate(selectedBooking.bookingDate)}
            </p>
            <p>
              <span className="font-medium">Ngày tạo lịch hẹn:</span> {formatDate(selectedBooking.createdAt)}
            </p>
            
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
          </div>
        )}
      </Modal>
    </div>
    </>
  );
};

export default MyBooking;