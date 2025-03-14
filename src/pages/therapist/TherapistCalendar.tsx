import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, isAfter, startOfToday, subDays } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import AuthService from "../service/AuthService";
// Time slot definitions
const slots = [
  { id: 1, time: "7:30-9:00" },
  { id: 2, time: "9:30-11:00" },
  { id: 3, time: "11:30-13:00" },
  { id: 4, time: "13:30-15:00" },
  { id: 5, time: "15:30-17:00" },
  { id: 6, time: "17:30-19:00" },
  { id: 7, time: "19:30-21:00" },
];
interface Schedule {
  scheduleId: string;
  therapistId: string;
  date: string;
  slot: number;
  isAvailable: boolean;
}
const TherapistCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;
  const today = startOfToday();
  // Fetch therapist's schedule on component mount and whenever selectedDate changes
  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);
  
  // Set up the Hanoi timezone clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  const fetchSchedule = async () => {
    const token = AuthService.getToken();
    if (!token) {
      console.error('Người dùng chưa đăng nhập hoặc thiếu quyền truy cập.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Get_Schedule_By_TherapistId',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.statusText}`);
      }
      const data: Schedule[] = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error('Lỗi khi lấy lịch trình:', error);
      toast.error('Không thể tải lịch trình. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    // Only allow going to previous month if it's not before current month
    if (!isBeforeCurrentMonth(newDate)) {
      setSelectedDate(newDate);
    }
  };
  
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
  const handleDateChange = (date: Date) => {
    // Only allow selecting dates that are today or in the future
    if (isAfter(date, subDays(today, 1))) {
      setSelectedDate(date);
      setSelectedSlot(null);
    } else {
      toast.error("Không thể chọn ngày trong quá khứ!");
    }
  };
  
  // Check if a date is before the current month
  const isBeforeCurrentMonth = (date: Date) => {
    const currentMonth = new Date();
    return date.getFullYear() < currentMonth.getFullYear() || 
           (date.getFullYear() === currentMonth.getFullYear() && 
            date.getMonth() < currentMonth.getMonth());
  };
  // Check if a date is in the past
  const isDateInPast = (date: Date) => {
    return !isAfter(date, subDays(today, 1));
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
    
    // Double check that selected date is not in the past
    if (isDateInPast(selectedDate)) {
      setError("Không thể tạo lịch cho ngày trong quá khứ!");
      return;
    }
  
    setError("");
    setShowModal(false);
  
    const dateToSend = new Date(selectedDate);
    dateToSend.setDate(dateToSend.getDate() + 1);
  
    const requestData = [
      {
        therapistId: therapistId, 
        date: dateToSend.toISOString(), 
        slot: selectedSlot, 
        isAvailable: true,
      }
    ];
  
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
  
      if (!response.ok) {
        throw new Error(responseText || "Lỗi không xác định khi tạo lịch.");
      }
  
      toast.success("Lịch đã được tạo thành công!");
      fetchSchedule(); // Refresh schedule after successful creation
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };
  const handleDelete = async (scheduleItem: Schedule) => {
    const token = AuthService.getToken();
    if (!token) {
      toast.error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!');
      return;
    }
    const requestData = [{
      scheduleId: scheduleItem.scheduleId,
      therapistId: scheduleItem.therapistId,
      date: scheduleItem.date,
      slot: scheduleItem.slot,
      isAvailable: false
    }];
    try {
      const response = await fetch(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Update_Schedule',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        }
      );
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.statusText}`);
      }
      toast.success('Đã xóa lịch trống thành công!');
      fetchSchedule(); // Refresh schedule after successful deletion
    } catch (error) {
      console.error('Lỗi khi cập nhật lịch:', error);
      toast.error('Không thể xóa lịch. Vui lòng thử lại sau.');
    }
  };
  // Format date for comparison
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  // Get schedules for selected date
  const getSchedulesForSelectedDate = () => {
    return schedule.filter(slot => {
      const scheduleDate = new Date(slot.date);
      scheduleDate.setDate(scheduleDate.getDate() - 1); 
      return formatDate(scheduleDate) === formatDate(selectedDate);
    });
  };
  // Check if a slot is scheduled for the selected date
  const isSlotScheduled = (slotId: number) => {
    return getSchedulesForSelectedDate().some(
      schedule => schedule.slot === slotId && schedule.isAvailable
    );
  };
  // Get schedule item by slot ID
  const getScheduleBySlot = (slotId: number) => {
    return getSchedulesForSelectedDate().find(
      schedule => schedule.slot === slotId && schedule.isAvailable
    );
  };
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDay = startOfMonth(selectedDate).getDay();
  const schedulesForSelectedDate = getSchedulesForSelectedDate();
  
  // Format dates with day names for schedule display
  const formatHanoiTime = (date: Date) => {
    // Create a new date object for manipulation
    const utcDate = new Date(date);
    
    // Get the current UTC time in milliseconds
    const utcTime = utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000);
    
    // Convert to UTC+7 (Hanoi time)
    const hanoiTime = new Date(utcTime + (7 * 60 * 60 * 1000));
    
    return format(hanoiTime, "HH:mm:ss");
  };
  const formatDateWithDayName = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-center">Quản lý lịch làm việc</h2>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center">
          <span className="mr-2">⏰</span>
          <span>Giờ Hà Nội (UTC+7): {formatHanoiTime(currentTime)}</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar section */}
        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={handlePrevMonth} 
              className={`p-2 rounded ${isBeforeCurrentMonth(subMonths(selectedDate, 1)) ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
              disabled={isBeforeCurrentMonth(subMonths(selectedDate, 1))}
            >
              &lt;
            </button>
            <h2 className="text-lg font-semibold">{format(selectedDate, "MMMM yyyy")}</h2>
            <button onClick={handleNextMonth} className="p-2 bg-gray-300 rounded hover:bg-gray-400">&gt;</button>
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
              const isPastDate = isDateInPast(currentDate);
              
              // Check if the date has any schedules
              const hasSchedule = schedule.some(slot => {
                const scheduleDate = new Date(slot.date);
                scheduleDate.setDate(scheduleDate.getDate() - 1);
                return formatDate(scheduleDate) === formatDate(currentDate) && slot.isAvailable;
              });
              return (
                <button
                  key={i}
                  onClick={() => handleDateChange(currentDate)}
                  disabled={isPastDate}
                  className={`p-2 rounded ${
                    currentDate.toDateString() === selectedDate.toDateString() 
                      ? "bg-blue-600 text-white" 
                      : isPastDate
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : hasSchedule 
                          ? "bg-green-300 hover:bg-green-400" 
                          : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
        {/* Slots selection section */}
        <div className="w-full md:w-1/2 space-y-4">
          <h3 className="text-lg font-semibold">{formatDateWithDayName(selectedDate)}</h3>
          <div className="border rounded-lg">
            {slots.map((slot) => {
              const isScheduled = isSlotScheduled(slot.id);
              const scheduleItem = getScheduleBySlot(slot.id);
              
              return (
                <div key={slot.id} className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                  isScheduled ? 'bg-green-100' : ''
                }`}>
                  <span>{`Slot ${slot.id}`}</span>
                  <span>{slot.time}</span>
                  {isScheduled ? (
                    <button 
                      onClick={() => scheduleItem && handleDelete(scheduleItem)} 
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  ) : (
                    <input 
                      type="radio" 
                      checked={selectedSlot === slot.id} 
                      onChange={() => toggleSlot(slot.id)} 
                      className="w-5 h-5"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {selectedSlot && !isSlotScheduled(selectedSlot) && !isDateInPast(selectedDate) && (
            <div className="flex gap-4 mt-4">
              <button 
                onClick={openConfirmModal} 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Tạo lịch trống
              </button>
            </div>
          )}
          {isDateInPast(selectedDate) && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded-lg mt-4">
              <p>Không thể tạo lịch cho ngày trong quá khứ!</p>
            </div>
          )}
        </div>
      </div>
      {/* Schedule summary section */}
      {schedulesForSelectedDate.length > 0 && (
        <div className="mt-8 bg-gray-50 p-5 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Lịch trống ngày {format(selectedDate, "dd/MM/yyyy")}</h3>
          <ul className="space-y-2">
            {schedulesForSelectedDate.map((schedule) => {
              const matchingSlot = slots.find(s => s.id === schedule.slot);
              return (
                <li key={schedule.scheduleId} className="p-3 bg-white rounded-lg shadow-sm flex justify-between items-center border border-gray-200">
                  <span>
                    <strong>Slot {schedule.slot}:</strong> {matchingSlot?.time || ''}
                  </span>
                  <button 
                    onClick={() => handleDelete(schedule)} 
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all"
                  >
                    Xóa
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md md:max-w-lg text-center">
            <h2 className="text-lg font-semibold mb-4">Xác nhận tạo lịch trống</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <p><strong>Ngày:</strong> {format(selectedDate, "MMMM d, yyyy")}</p>
            <p><strong>Slot:</strong> {selectedSlot} ({slots.find(s => s.id === selectedSlot)?.time})</p>
            <div className="flex gap-4 mt-4 justify-center">
              <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Xác nhận</button>
              <button onClick={closeConfirmModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Hủy</button>
            </div>
          </div>
        </div>
      )}
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-150"></div>
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-300"></div>
              <span className="ml-2">Đang tải...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TherapistCalendar;