import React from "react";
import { format } from "date-fns";

interface Slot {
  id: string;
  time: string;
}

interface ModalProps {
  showModal: boolean;
  closeConfirmModal: () => void;
  handleConfirm: () => Promise<void>;  // Changed to Promise<void>
  error?: string;
  selectedDate: Date;
  selectedSlot: string;
  slots: Slot[];
}

const Modal: React.FC<ModalProps> = ({ 
  showModal, 
  closeConfirmModal, 
  handleConfirm, 
  error, 
  selectedDate, 
  selectedSlot, 
  slots 
}) => {
  if (!showModal) return null;

  const handleConfirmClick = async () => {
    await handleConfirm();  // Handle the async operation
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md md:max-w-lg text-center">
        <h2 className="text-lg font-semibold mb-4">Xác nhận tạo lịch trống</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <p><strong>Ngày:</strong> {format(selectedDate, "MMMM d, yyyy")}</p>
        <p>
          <strong>Slot:</strong> {selectedSlot} (
          {slots.find((s: Slot) => s.id === selectedSlot)?.time || "Không có thông tin"}
          )
        </p>
        <div className="flex gap-4 mt-4 justify-center">
          <button 
            onClick={handleConfirmClick}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Xác nhận
          </button>
          <button 
            onClick={closeConfirmModal}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;