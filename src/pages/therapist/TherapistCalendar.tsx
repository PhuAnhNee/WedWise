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
  { id: "1", time: "Start 7:30 - End 9:00" },
  { id: "2", time: "Start 9:30 - End 11:00" },
  { id: "3", time: "Start 11:30 - End 13:00" },
  { id: "4", time: "Start 13:30 - End 15:00" },
  { id: "5", time: "Start 15:30 - End 17:00" },
  { id: "6", time: "Start 17:30 - End 19:00" },
  { id: "7", time: "Start 19:30 - End 21:00" },
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
        throw new Error(`Error: ${response.statusText}`);
      }
      const data: Schedule[] = await response.json();
      setSchedule(data);
    } catch (error) {
      toast.error("Unable to load schedule. Please try again later.");
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

  // Điều chỉnh giờ UTC sang giờ Hà Nội (UTC+7) cho dữ liệu lịch và API
  const adjustToHanoiTime = (date: Date) => {
    return addHours(date, 7);
  };

  const isDateInPast = (date: Date) => {
    const parsedDate = adjustToHanoiTime(date);
    return !isAfter(parsedDate, subDays(adjustToHanoiTime(today), 1));
  };

  const isBeforeCurrentMonth = (date: Date) => {
    const hanoiDate = adjustToHanoiTime(date);
    const currentMonthDate = adjustToHanoiTime(new Date());
    return (
      hanoiDate.getFullYear() < currentMonthDate.getFullYear() ||
      (hanoiDate.getFullYear() === currentMonthDate.getFullYear() &&
        hanoiDate.getMonth() < currentMonthDate.getMonth())
    );
  };

  const openConfirmModal = () => {
    const token = AuthService.getToken();
    if (!therapistId || !token) {
      toast.error("You are not logged in or your session has expired!");
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
      setError("You are not logged in or the information is invalid.");
      return;
    }
    if (!selectedDate || selectedSlot === null) {
      setError("Please select a date and a time slot!");
      return;
    }
    if (isDateInPast(selectedDate)) {
      setError("Cannot create a schedule for a past date!");
      return;
    }
    setError("");
    setShowModal(false);

    const dateToSend = adjustToHanoiTime(selectedDate);

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
        throw new Error(responseText || "Unknown error occurred while creating schedule.");
      }
      toast.success("Schedule created successfully!");
      setSelectedSlot(null);
      await fetchSchedule();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred, please try again!");
    }
  };

  const handleUpdateStatus = async (scheduleItem: Schedule, status: number) => {
    const token = AuthService.getToken();
    if (!token) {
      toast.error("You are not logged in or your session has expired!");
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
        throw new Error(`Error: ${response.statusText}`);
      }
      toast.success("Status updated successfully!");
      await fetchSchedule();
    } catch (error) {
      toast.error("Unable to update status. Please try again later.");
    }
  };

  const formatDate = (date: Date) => {
    const adjustedDate = adjustToHanoiTime(date);
    return adjustedDate.toISOString().split("T")[0];
  };

  const getSchedulesForSelectedDate = (): Schedule[] => {
    const adjustedSelectedDate = adjustToHanoiTime(selectedDate);
    const formattedSelectedDate = formatDate(adjustedSelectedDate);

    const filteredSchedules = schedule.filter((slot) => {
      const scheduleDate = adjustToHanoiTime(new Date(slot.date));
      const formattedScheduleDate = formatDate(scheduleDate);
      return formattedScheduleDate === formattedSelectedDate;
    });
    return filteredSchedules;
  };

  const isSlotScheduled = (slotId: number) =>
    getSchedulesForSelectedDate().some(
      (schedule) => schedule.slot === slotId && (schedule.status === 0 || schedule.status === 1 || schedule.status === 2)
    );

  const getScheduleBySlot = (slotId: number): Schedule | null => {
    return getSchedulesForSelectedDate().find((schedule) => schedule.slot === slotId) || null;
  };

  // Hiển thị giờ địa phương trực tiếp, không cần điều chỉnh thêm nếu máy đã ở UTC+7
  const formatHanoiTime = (date: Date) => {
    return format(date, "HH:mm:ss");
  };

  return (
    <div className="relative min-h-screen p-6">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-center">Schedule Management</h2>
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