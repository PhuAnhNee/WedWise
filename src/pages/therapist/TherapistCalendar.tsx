import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

const slots = [
  { id: 1, time: "7:30-9:00" },
  { id: 2, time: "9:30-11:00" },
  { id: 3, time: "11:30-13:00" },
  { id: 4, time: "13:30-15:00" },
  { id: 5, time: "15:30-17:00" },
  { id: 6, time: "17:30-19:00" },
  { id: 7, time: "19:30-21:00" },
];

const TherapistCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [price, setPrice] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  // Chuyển tháng
  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  // Chọn ngày
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Toggle slot
  const toggleSlot = (id: number) => {
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((slot) => slot !== id) : [...prev, id]
    );
  };

  // Mở modal xác nhận
  const openConfirmModal = () => {
    setShowModal(true);
  };

  // Đóng modal
  const closeConfirmModal = () => {
    setShowModal(false);
  };

  // Xác nhận đặt lịch
  const handleConfirm = () => {
    setShowModal(false);
    toast.success("Lịch hẹn đã được đặt thành công!", { duration: 3000 });

    console.log({
      Date: format(selectedDate, "MMMM d, yyyy"),
      Price: price,
      MeetingLink: meetingLink,
      Slots: selectedSlots.join(", "),
    });
  };

  // Xử lý validate và xác nhận
  const validateAndConfirm = () => {
    if (!selectedDate || !price || selectedSlots.length === 0) {
      setError("Vui lòng không để trống bất kỳ thông tin nào!");
      return;
    }

    // Nếu không có lỗi, gọi hàm xác nhận
    setError(""); // Xóa lỗi nếu đã nhập đủ thông tin
    handleConfirm();
  };

  // Lấy số ngày trong tháng
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDay = startOfMonth(selectedDate).getDay();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar */}
        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-2 bg-gray-300 rounded">&lt;</button>
            <h2 className="text-lg font-semibold">{format(selectedDate, "MMMM yyyy")}</h2>
            <button onClick={handleNextMonth} className="p-2 bg-gray-300 rounded">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div key={day} className="font-semibold">{day}</div>
            ))}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="invisible">00</div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
              return (
                <button
                  key={i}
                  onClick={() => handleDateChange(currentDate)}
                  className={`p-2 rounded ${currentDate.toDateString() === selectedDate.toDateString() ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot Booking */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* Enter Slot Price */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Enter Slot Price:</label>
            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250.000" className="border p-2 rounded w-32" />
            <span>VND</span>
          </div>

          {/* Enter Meeting Link */}
          <div>
            <label className="font-semibold block mb-2">Enter Meeting Link:</label>
            <input type="text" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." className="border p-2 rounded w-full" />
          </div>

          {/* Slots */}
          <div className="border rounded-lg">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <span>{`Slot ${slot.id}`}</span>
                <span>{slot.time}</span>
                <input type="checkbox" checked={selectedSlots.includes(slot.id)} onChange={() => toggleSlot(slot.id)} className="w-5 h-5" />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button onClick={openConfirmModal} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Confirm</button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md md:max-w-lg text-center">
            <h2 className="text-lg font-semibold mb-4">Xác nhận lịch hẹn</h2>
            
            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-red-500 mb-2">{error}</p>}

            <p><strong>Ngày:</strong> {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Chưa chọn"}</p>
            <p><strong>Giá:</strong> {price ? `${price} VND` : "Chưa nhập"}</p>
            <p><strong>Slots:</strong> {selectedSlots.length > 0 ? selectedSlots.join(", ") : "Chưa chọn"}</p>

            <p className="text-sm text-gray-500 mt-2">Hủy miễn phí trước 1 ngày.</p>

            <div className="flex gap-4 mt-4 justify-center">
              <button onClick={validateAndConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Xác nhận</button>
              <button onClick={closeConfirmModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendar;
