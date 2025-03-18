import React from "react";
import { format, addHours } from "date-fns";

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
  const adjustToHanoiTime = (date: Date) => {
    return addHours(date, 7);
  };

  const formatDate = (date: Date) => {
    const adjustedDate = adjustToHanoiTime(new Date(date));
    return adjustedDate.toISOString().split("T")[0];
  };

  const schedulesForSelectedDate = schedules.filter((slot) => {
    const scheduleDate = adjustToHanoiTime(new Date(slot.date));
    const adjustedSelectedDate = adjustToHanoiTime(new Date(selectedDate));
    return formatDate(scheduleDate) === formatDate(adjustedSelectedDate);
  });

  if (schedulesForSelectedDate.length === 0) return null;

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-green-100"; // Available
      case 1:
        return "bg-yellow-100"; // Booked
      case 2:
        return "bg-red-100"; // Busy
      default:
        return "";
    }
  };

  console.log("ScheduleSummary selectedDate:", formatDate(selectedDate)); // Debug log
  console.log("Schedules for selected date:", schedulesForSelectedDate); // Debug log

  return (
    <div className="mt-8 bg-gray-50 p-5 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold mb-4">
        Lịch trống ngày {format(selectedDate, "dd/MM/yyyy")}
      </h3>
      <ul className="space-y-2">
        {schedulesForSelectedDate.map((schedule) => {
          const matchingSlot = slots.find((s) => Number(s.id) === schedule.slot);
          return (
            <li
              key={schedule.scheduleId}
              className={`p-3 rounded-lg shadow-sm flex justify-between items-center border border-gray-200 ${getStatusColor(schedule.status)}`}
            >
              <span>
                <strong>Slot {schedule.slot}:</strong> {matchingSlot?.time || ""}
              </span>
              <select
                value={schedule.status}
                onChange={(e) =>
                  handleUpdateStatus(schedule, Number(e.target.value))
                }
                className="px-3 py-1 rounded border border-gray-300"
                disabled={schedule.status === 1} // Disable if status = 1 (Booked)
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