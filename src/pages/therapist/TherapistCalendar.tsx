import { useState, useEffect, useCallback } from "react";
import { format, startOfToday, subDays, isAfter, addHours } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import AuthService from "../service/AuthService";
import Calendar from "./therapistComponent/Calendar";
import SlotList from "./therapistComponent/SlotList";
import Modal from "./therapistComponent/Modal";
import ScheduleSummary from "./therapistComponent/ScheduleSummary";

interface Schedule {
  scheduleId: string;
  therapistId: string;
  date: string;
  slot: number;
  status: number;
}

interface Slot {
  id: string;
  time: string;
}

const slots: Slot[] = [
  { id: "1", time: "Bắt đầu 7:30 - Kết thúc 9:00" },
  { id: "2", time: "Bắt đầu 9:30 - Kết thúc 11:00" },
  { id: "3", time: "Bắt đầu 11:30 - Kết thúc 13:00" },
  { id: "4", time: "Bắt đầu 13:30 - Kết thúc 15:00" },
  { id: "5", time: "Bắt đầu 15:30 - Kết thúc 17:00" },
  { id: "6", time: "Bắt đầu 17:30 - Kết thúc 19:00" },
  { id: "7", time: "Bắt đầu 19:30 - Kết thúc 21:00" },
];

const TherapistCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(format(selectedDate, "yyyy-MM"));

  const currentUser = AuthService.getCurrentUser();
  const therapistId = currentUser?.UserId;
  const today = startOfToday();

  const fetchSchedule = useCallback(async () => {
    const token = AuthService.getToken();
    if (!token) {
      console.error("Người dùng chưa đăng nhập hoặc thiếu quyền truy cập.");
      return;
    }
    try {
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Get_Schedule_By_TherapistId",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.statusText}`);
      }
      const data: Schedule[] = await response.json();
      console.log("Fetched schedules:", data); // Debug log
      setSchedule(data);
    } catch (error) {
      console.error("Lỗi khi lấy lịch trình:", error);
      toast.error("Không thể tải lịch trình. Vui lòng thử lại sau.");
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newMonth = format(selectedDate, "yyyy-MM");
    if (newMonth !== currentMonth) {
      setCurrentMonth(newMonth);
      fetchSchedule();
    }
  }, [selectedDate, currentMonth, fetchSchedule]);

  const adjustToHanoiTime = (date: Date) => {
    return addHours(date, 7); // Thêm 7 giờ cho múi giờ Hà Nội
  };

  const isDateInPast = (date: string) => {
    const parsedDate = adjustToHanoiTime(new Date(date));
    return !isAfter(parsedDate, subDays(adjustToHanoiTime(today), 1));
  };

  const isBeforeCurrentMonth = (date: Date) => {
    const hanoiDate = adjustToHanoiTime(date);
    const currentMonth = adjustToHanoiTime(new Date());
    return (
      hanoiDate.getFullYear() < currentMonth.getFullYear() ||
      (hanoiDate.getFullYear() === currentMonth.getFullYear() && hanoiDate.getMonth() < currentMonth.getMonth())
    );
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
    if (isDateInPast(formatDate(selectedDate))) {
      setError("Không thể tạo lịch cho ngày trong quá khứ!");
      return;
    }
    setError("");
    setShowModal(false);

    const dateToSend = adjustToHanoiTime(new Date(selectedDate));

    const requestData = [
      {
        therapistId: therapistId,
        date: dateToSend.toISOString(),
        slot: selectedSlot,
        status: 0,
      },
    ];

    try {
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Create_Schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || "Lỗi không xác định khi tạo lịch.");
      }
      toast.success("Lịch đã được tạo thành công!");
      setSelectedSlot(null); // Reset selectedSlot sau khi tạo
      await fetchSchedule(); // Làm mới dữ liệu từ API
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  const handleUpdateStatus = async (scheduleItem: Schedule, status: number) => {
    const token = AuthService.getToken();
    if (!token) {
      toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      return;
    }
    const requestData = [
      {
        scheduleId: scheduleItem.scheduleId,
        therapistId: scheduleItem.therapistId,
        date: scheduleItem.date,
        slot: scheduleItem.slot,
        status: status,
      },
    ];
    try {
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Update_Schedule",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.statusText}`);
      }
      toast.success("Cập nhật trạng thái thành công!");
      await fetchSchedule(); // Làm mới dữ liệu từ API
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch:", error);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
    }
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const getSchedulesForSelectedDate = (): Schedule[] => {
    const filteredSchedules = schedule.filter((slot) => {
      const scheduleDate = adjustToHanoiTime(new Date(slot.date));
      const formattedScheduleDate = formatDate(scheduleDate);
      const formattedSelectedDate = formatDate(selectedDate);
      console.log(
        `Comparing dates - Schedule: ${formattedScheduleDate}, Selected: ${formattedSelectedDate}`
      ); // Debug log
      return formattedScheduleDate === formattedSelectedDate;
    });
    console.log("Filtered schedules for selected date:", filteredSchedules); // Debug log
    return filteredSchedules;
  };

  const isSlotScheduled = (slotId: number) =>
    getSchedulesForSelectedDate().some(
      (schedule) => schedule.slot === slotId && (schedule.status === 0 || schedule.status === 1 || schedule.status === 2)
    );

  const getScheduleBySlot = (slotId: number): Schedule | null => {
    const scheduleItem = getSchedulesForSelectedDate().find((schedule) => schedule.slot === slotId) || null;
    console.log(`Schedule for slot ${slotId}:`, scheduleItem); // Debug log
    return scheduleItem;
  };

  const formatHanoiTime = (date: Date) => {
    const hanoiTime = adjustToHanoiTime(date);
    return format(hanoiTime, "HH:mm:ss");
  };

  return (
    <div className="relative min-h-screen p-6">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-center">Quản lý lịch làm việc</h2>
          <div className="flex flex-col items-end space-y-4">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center">
              <span className="mr-2">⏰</span>
              <span>HoChiMinh: {formatHanoiTime(currentTime)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <Calendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isDateInPast={isDateInPast}
            isBeforeCurrentMonth={isBeforeCurrentMonth}
          />
          <SlotList
            slots={slots}
            selectedDate={formatDate(selectedDate)}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            isSlotScheduled={isSlotScheduled}
            getScheduleBySlot={getScheduleBySlot}
            handleUpdateStatus={handleUpdateStatus}
            isDateInPast={isDateInPast}
            openConfirmModal={openConfirmModal}
          />
        </div>
        <ScheduleSummary
          selectedDate={selectedDate}
          schedules={schedule}
          slots={slots}
          handleUpdateStatus={handleUpdateStatus}
        />
        <Modal
          showModal={showModal}
          closeConfirmModal={closeConfirmModal}
          handleConfirm={handleConfirm}
          error={error}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot?.toString() || ""}
          slots={slots}
        />
      </div>
    </div>
  );
};

export default TherapistCalendar;