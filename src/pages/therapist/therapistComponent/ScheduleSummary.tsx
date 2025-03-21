import React from "react";
import { format, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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

interface ScheduleSummaryProps {
  selectedDate: Date;
  schedules: Schedule[];
  slots: Slot[];
  handleUpdateStatus: (scheduleItem: Schedule, status: number) => void;
}

const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({
  selectedDate,
  schedules,
  slots,
  handleUpdateStatus,
}) => {
  const hanoiTimeZone = "Asia/Ho_Chi_Minh";
  const toHanoiTime = (date: Date) => toZonedTime(date, hanoiTimeZone);

  const formatDate = (date: Date) => format(toHanoiTime(startOfDay(date)), "yyyy-MM-dd");

  const schedulesForSelectedDate = schedules.filter((slot) => {
    const scheduleDate = toHanoiTime(new Date(slot.date));
    return formatDate(scheduleDate) === formatDate(selectedDate);
  });

  if (schedulesForSelectedDate.length === 0) return null;

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-green-50 border-green-200";
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-red-50 border-red-200";
      default:
        return "";
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Lịch trống ngày {format(selectedDate, "dd/MM/yyyy")}
      </h3>
      <ul className="space-y-4">
        {schedulesForSelectedDate.map((schedule) => {
          const matchingSlot = slots.find((s) => Number(s.id) === schedule.slot);
          return (
            <li
              key={schedule.scheduleId}
              className={`p-4 rounded-xl flex justify-between items-center border ${getStatusColor(
                schedule.status
              )} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex-1">
                <span className="text-lg font-semibold text-gray-900">Slot {schedule.slot}: </span>
                <span className="text-lg font-medium text-gray-700">
                  {matchingSlot?.time || "Không có thông tin"}
                </span>
              </div>
              <select
                value={schedule.status}
                onChange={(e) => handleUpdateStatus(schedule, Number(e.target.value))}
                className={`px-4 py-2 rounded-lg border border-gray-300 text-lg font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  schedule.status === 1 ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                }`}
                disabled={schedule.status === 1}
              >
                <option value={0}>Lịch trống</option>
                <option value={1}>Được đặt</option>
                <option value={2}>Lịch bận</option>
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ScheduleSummary;