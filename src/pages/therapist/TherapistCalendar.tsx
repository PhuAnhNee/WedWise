import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import AuthService from "../service/AuthService";


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
  const [selectedDate, setSelectedDate] = useState(new Date());  // Ngày mặc định là ngày hiện tại
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);  // Cập nhật selectedDate khi người dùng chọn ngày mới
    console.log("Ngày đã chọn:", date);  // Kiểm tra giá trị của date
  };
  

  const toggleSlot = (id: number) => {
    setSelectedSlot((prev) => (prev === id ? null : id));
  };

  const openConfirmModal = () => {
    const token = AuthService.getToken();
    if (!therapistId || !token) {
      toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      return;
    }
    setShowModal(true);
  };

  const closeConfirmModal = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    const token = AuthService.getToken();
  
    if (!therapistId || !token) {
      setError("Bạn chưa đăng nhập hoặc thông tin không hợp lệ.");
      return;
    }
  
    if (!selectedDate || selectedSlot === null) {
      setError("Vui lòng chọn một ngày và một khung giờ!");
      return;
    }
  
    setError("");
    setShowModal(false);
  
    // Tạo một bản sao của selectedDate và cộng thêm 1 ngày
    const dateToSend = new Date(selectedDate);
    dateToSend.setDate(dateToSend.getDate() + 1);
  
    // In ngày đã được cộng thêm 1 ngày để kiểm tra
    console.log("Ngày sau khi cộng thêm 1 ngày:", dateToSend);
  
    // Đảm bảo ngày được chọn đúng
    const requestData = [
      {
        therapistId: therapistId, // Sử dụng therapistId từ người dùng hiện tại
        date: dateToSend.toISOString(), // Định dạng ISO string với ngày giờ đúng
        slot: selectedSlot, // Khung giờ được chọn
        isAvailable: true,
      }
    ];
  
    // Log dữ liệu gửi đi
    console.log("Dữ liệu gửi đi:", JSON.stringify(requestData, null, 2));
  
    try {
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Create_Schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );
  
      const responseText = await response.text();
      console.log("Phản hồi từ API:", responseText);
  
      if (!response.ok) {
        throw new Error(responseText || "Lỗi không xác định khi tạo lịch.");
      }
  
      toast.success("Lịch đã được tạo thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };
  
  
  
  

  const daysInMonth = getDaysInMonth(selectedDate);
  const startDay = startOfMonth(selectedDate).getDay();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row gap-8">
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
                  onClick={() => handleDateChange(currentDate)}  // Cập nhật selectedDate khi chọn ngày
                  className={`p-2 rounded ${currentDate.toDateString() === selectedDate.toDateString() ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-4">
          <div className="border rounded-lg">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <span>{`Slot ${slot.id}`}</span>
                <span>{slot.time}</span>
                <input type="radio" checked={selectedSlot === slot.id} onChange={() => toggleSlot(slot.id)} className="w-5 h-5" />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={openConfirmModal} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Xác nhận</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md md:max-w-lg text-center">
            <h2 className="text-lg font-semibold mb-4">Xác nhận lịch trống</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <p><strong>Ngày:</strong> {format(selectedDate, "MMMM d, yyyy")}</p>
            <p><strong>Slot:</strong> {selectedSlot}</p>
            <div className="flex gap-4 mt-4 justify-center">
              <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Xác nhận</button>
              <button onClick={closeConfirmModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendar;
