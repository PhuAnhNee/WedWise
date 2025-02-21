import React, { useState, useEffect } from "react";
import { Modal, Button, message } from "antd";
import axios from "axios";

const API_URL = "https://67b72bdb2bddacfb270df514.mockapi.io/Therapist";

// Định nghĩa interface cho Therapist
interface Therapist {
  id: string;
  name: string;
  status: boolean;
}

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Therapist[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Therapist | null>(null);

  // Fetch danh sách lịch hẹn từ API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get<Therapist[]>(API_URL);
      setBookings(response.data.filter((t: Therapist) => t.status === true)); // Lọc lịch hẹn đang chờ xác nhận
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
    }
  };

  // Xử lý hủy lịch hẹn
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await axios.put(`${API_URL}/${selectedBooking.id}`, { status: false });
      message.success("Lịch hẹn đã được hủy!");
      fetchBookings(); // Cập nhật danh sách sau khi hủy
    } catch (error) {
      message.error("Hủy lịch hẹn thất bại, vui lòng thử lại!");
    } finally {
      setIsModalVisible(false);
      setSelectedBooking(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Lịch hẹn của tôi</h1>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {bookings.map((therapist) => (
            <div key={therapist.id} className="p-4 border rounded-lg shadow-lg bg-gray-100">
              <h3 className="text-lg font-semibold text-center">{therapist.name}</h3>
              <p className="text-center text-yellow-500 font-semibold">Đang chờ xác nhận</p>
              <Button
                danger
                className="mt-4 w-full"
                onClick={() => {
                  setSelectedBooking(therapist);
                  setIsModalVisible(true);
                }}
              >
                Hủy lịch hẹn
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Bạn chưa có lịch hẹn nào.</p>
      )}

      {/* Modal xác nhận hủy lịch */}
      <Modal
        title="Xác nhận hủy lịch hẹn"
        open={isModalVisible}
        onOk={handleCancelBooking}
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
      >
        <p>Bạn có chắc chắn muốn hủy lịch hẹn với <strong>{selectedBooking?.name}</strong> không?</p>
      </Modal>
    </div>
  );
};

export default MyBooking;
