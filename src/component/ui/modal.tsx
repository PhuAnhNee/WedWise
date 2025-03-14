import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ isOpen, onClose, children, className = "" }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // Đóng khi click ra ngoài
    >
      <div 
        className={`bg-white p-4 rounded-lg w-1/3 shadow-lg ${className}`} 
        onClick={(e) => e.stopPropagation()} // Ngăn modal tự đóng khi click vào bên trong
      >
        {children}
        <button className="mt-2 text-red-500" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default Modal;
