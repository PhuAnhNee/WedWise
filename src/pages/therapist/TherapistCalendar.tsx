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
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const toggleSlot = (id: number) => {
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((slot) => slot !== id) : [...prev, id]
    );
  };

  const openConfirmModal = () => {
    setShowModal(true);
  };

  const closeConfirmModal = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày và một khung giờ!");
      return;
    }

    setError("");
    setShowModal(false);
    
    try {
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Create_Schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            therapistId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", 
            date: selectedDate.toISOString(),
            slot: selectedSlots,
            isAvailable: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tạo lịch, vui lòng thử lại.");
      }

      toast.success("Lịch trống đã được cập nhật thành công!");
    } catch (error) {
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
                  onClick={() => handleDateChange(currentDate)}
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
                <input type="checkbox" checked={selectedSlots.includes(slot.id)} onChange={() => toggleSlot(slot.id)} className="w-5 h-5" />
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
            <p><strong>Slots:</strong> {selectedSlots.join(", ")}</p>
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
