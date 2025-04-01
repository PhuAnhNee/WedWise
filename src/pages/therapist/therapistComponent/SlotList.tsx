import React from "react";

interface Slot {
  id: string;
  time: string;
}

interface Schedule {
  scheduleId: string;
  therapistId: string;
  date: string;
  slot: number;
  status: number;
}

interface SlotListProps {
  slots: Slot[];
  selectedDate: string;
  selectedSlot: number | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<number | null>>;
  isSlotScheduled: (id: number) => boolean;
  getScheduleBySlot: (id: number) => Schedule | null;
  isDateInPast: (date: Date) => boolean;
  isSlotTimeInPast: (date: Date, slotId: number) => boolean;
  openConfirmModal: () => void;
  handleUpdateStatus: (scheduleItem: Schedule, status: number) => void; 
}

const SlotList: React.FC<SlotListProps> = ({
  slots,
  selectedDate,
  selectedSlot,
  setSelectedSlot,
  isSlotScheduled,
  getScheduleBySlot,
  isDateInPast,
  isSlotTimeInPast,
  openConfirmModal,
}) => {
  const toggleSlot = (id: number) => {
    const date = new Date(selectedDate);
    if (!isDateInPast(date) && !isSlotTimeInPast(date, id)) {
      setSelectedSlot((prev) => (prev === id ? null : id));
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-green-100";
      case 1:
        return "bg-yellow-100";
      case 2:
        return "bg-red-100";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="w-full md:w-1/2 space-y-4">
      <h3 className="text-lg font-semibold">{selectedDate}</h3>
      <div className="border rounded-lg">
        {slots.map((slot) => {
          const slotId = Number(slot.id);
          const scheduleItem = getScheduleBySlot(slotId);
          const isScheduled = !!scheduleItem;
          const status = scheduleItem ? scheduleItem.status : 1;
          const date = new Date(selectedDate);
          const isPastSlot = isDateInPast(date) || isSlotTimeInPast(date, slotId);

          return (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                isScheduled ? getStatusColor(status) : ""
              } ${isPastSlot ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex-1 flex items-center space-x-4">
                <span className="w-16">{`Slot ${slot.id}`}</span>
                <span className="flex-1">{slot.time}</span>
              </div>
              {isScheduled ? (
                <span className="text-sm font-medium">
                  {status === 0 && "Available"}
                  {status === 1 && "Booked"}
                  {status === 2 && "Busy"}
                </span>
              ) : (
                <input
                  type="radio"
                  checked={selectedSlot === slotId && !isScheduled}
                  onChange={() => toggleSlot(slotId)}
                  className="w-5 h-5"
                  disabled={isPastSlot || isScheduled}
                />
              )}
            </div>
          );
        })}
      </div>
      {selectedSlot && !isSlotScheduled(selectedSlot) && !isDateInPast(new Date(selectedDate)) && !isSlotTimeInPast(new Date(selectedDate), selectedSlot) && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={openConfirmModal}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Available Schedule
          </button>
        </div>
      )}
      {isDateInPast(new Date(selectedDate)) && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded-lg mt-4">
          <p>Cannot create schedule for past dates!</p>
        </div>
      )}
    </div>
  );
};

export default SlotList;