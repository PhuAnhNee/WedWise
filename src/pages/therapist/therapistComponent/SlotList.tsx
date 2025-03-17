interface Slot {
    id: string;  // Changed to string to match Modal
    time: string;
  }
  
  interface ScheduleItem {
    scheduleId: string;  // Changed to match TherapistCalendar's Schedule
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
    getScheduleBySlot: (id: number) => ScheduleItem | null;
    handleUpdateStatus: (scheduleItem: ScheduleItem, status: number) => void;
    isDateInPast: (date: string) => boolean;
    openConfirmModal: () => void;  // Added missing prop
  }
  
  const SlotList: React.FC<SlotListProps> = ({
    slots,
    selectedDate,
    selectedSlot,
    setSelectedSlot,
    isSlotScheduled,
    getScheduleBySlot,
    handleUpdateStatus,
    isDateInPast,
    openConfirmModal
  }) => {
    const toggleSlot = (id: number) => {
      setSelectedSlot((prev) => (prev === id ? null : id));
    };
  
    return (
      <div className="w-full md:w-1/2 space-y-4">
        <h3 className="text-lg font-semibold">{selectedDate}</h3>
        <div className="border rounded-lg">
          {slots.map((slot) => {
            const slotId = Number(slot.id);  // Convert string id to number for comparisons
            const isScheduled = isSlotScheduled(slotId);
            const scheduleItem = getScheduleBySlot(slotId);
            return (
              <div 
                key={slot.id} 
                className={`flex items-center justify-between p-3 border-b last:border-b-0 ${isScheduled ? 'bg-green-100' : ''}`}
              >
                <span>{`Slot ${slot.id}`}</span>
                <span>{slot.time}</span>
                {isScheduled && scheduleItem ? (
                  <select
                    value={scheduleItem.status}
                    onChange={(e) => handleUpdateStatus(scheduleItem, Number(e.target.value))}
                    className="px-3 py-1 rounded border border-gray-300"
                  >
                    <option value={0}>Đang hoạt động</option>
                    <option value={1}>Booked</option>
                    <option value={2}>Không khả dụng</option>
                  </select>
                ) : (
                  <input 
                    type="radio" 
                    checked={selectedSlot === slotId} 
                    onChange={() => toggleSlot(slotId)} 
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
    );
  };
  
  export default SlotList;