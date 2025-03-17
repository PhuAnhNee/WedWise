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
  handleUpdateStatus: (scheduleItem: Schedule, status: number) => void;
  isDateInPast: (date: string) => boolean;
  openConfirmModal: () => void;
}

const SlotList: React.FC<SlotListProps> = ({
  slots,
  selectedDate,
  selectedSlot,
  setSelectedSlot,
  isSlotScheduled,
  getScheduleBySlot,
  isDateInPast,
  openConfirmModal,
}) => {
  const toggleSlot = (id: number) => {
    if (!isDateInPast(selectedDate)) {
      setSelectedSlot((prev) => (prev === id ? null : id));
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-green-100"; // Lịch trống
      case 1:
        return "bg-yellow-100"; // Được đặt
      case 2:
        return "bg-red-100"; // Lịch bận
      default:
        return "";
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
          const status = scheduleItem ? scheduleItem.status : -1;

          return (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                isScheduled ? getStatusColor(status) : ""
              }`}
            >
              <span>{`Slot ${slot.id}`}</span>
              <span>{slot.time}</span>
              {isScheduled ? (
                <span className="text-sm font-medium">
                  {status === 0 && "Lịch trống"}
                  {status === 1 && "Được đặt"}
                  {status === 2 && "Lịch bận"}
                </span>
              ) : (
                <input
                  type="radio"
                  checked={selectedSlot === slotId && !isScheduled}
                  onChange={() => toggleSlot(slotId)}
                  className="w-5 h-5"
                  disabled={isDateInPast(selectedDate) || isScheduled} // Vô hiệu hóa nếu đã có lịch hoặc ngày quá khứ
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
  );
};

export default SlotList;