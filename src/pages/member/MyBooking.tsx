import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "antd";

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // 🗂 Lấy dữ liệu từ localStorage
  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(storedBookings);
  }, []);

  // 🛑 Hiển thị Modal xác nhận hủy
  const showCancelModal = (id: number) => {
    setSelectedBookingId(id);
    setIsModalVisible(true);
  };

  // ✅ Xác nhận hủy lịch hẹn
  const handleConfirmCancel = () => {
    if (selectedBookingId !== null) {
      const updatedBookings = bookings.filter((therapist) => therapist.id !== selectedBookingId);
      localStorage.setItem("bookings", JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
    }
    setIsModalVisible(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Lịch hẹn của tôi</h1>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {bookings.map((therapist) => (
            <div key={therapist.id} className="p-4 border rounded-lg shadow-lg bg-gray-100">
              <img src={therapist.avatar} alt={therapist.name} className="w-20 h-20 rounded-full mx-auto" />
              <h3 className="text-lg font-semibold text-center">{therapist.name}</h3>
              <p className="text-center text-gray-600">{therapist.specialty}</p>
              <p className="text-center text-yellow-500 font-semibold">Đang chờ xác nhận</p>

              {/* 🛑 Nút HỦY LỊCH - mở Modal */}
              <Button
                danger
                className="mt-4 w-full"
                onClick={() => showCancelModal(therapist.id)}
              >
                Hủy lịch hẹn
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Bạn chưa đặt lịch hẹn nào.</p>
      )}

      <div className="text-center mt-6">
        <Link to="/home/therapist" className="text-blue-500">← Quay lại danh sách chuyên gia</Link>
      </div>

      {/* 🚀 Modal xác nhận hủy lịch */}
      <Modal
        title="Xác nhận hủy lịch"
        open={isModalVisible}
        onOk={handleConfirmCancel}
        onCancel={() => setIsModalVisible(false)}
        okText="Đồng ý"
        cancelText="Hủy bỏ"
      >
        <p>Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
      </Modal>
    </div>
  );
};

export default MyBooking;
