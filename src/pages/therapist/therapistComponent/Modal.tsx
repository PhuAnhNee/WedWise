import React from "react";
import { format } from "date-fns";

interface Slot {
  id: string;
  time: string;
}

interface ModalProps {
  showModal: boolean;
  closeConfirmModal: () => void;
  handleConfirm: () => Promise<void>;
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
  slots,
}) => {
  if (!showModal) return null;

  const handleConfirmClick = async () => {
    await handleConfirm();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-300">
      <div
        className={`bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${
          showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Xác nhận tạo lịch trống
        </h2>
        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-6 text-center font-medium">
            {error}
          </p>
        )}
        <div className="space-y-4 text-gray-700">
          <p className="text-lg">
            <strong className="font-semibold">Ngày:</strong>{" "}
            <span className="text-gray-900">{format(selectedDate, "MMMM d, yyyy")}</span>
          </p>
          <p className="text-lg">
            <strong className="font-semibold">Slot:</strong>{" "}
            <span className="text-gray-900">
              {selectedSlot} (
              {slots.find((s: Slot) => s.id === selectedSlot)?.time || "Không có thông tin"})
            </span>
          </p>
        </div>
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={handleConfirmClick}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            Xác nhận
          </button>
          <button
            onClick={closeConfirmModal}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;