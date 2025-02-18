import React, { useEffect, useState } from "react";

interface CustomMessageProps {
    type: "success" | "error" | "warning";
    message: string;
    duration?: number;
    onClose: () => void;
}

const CustomMessage: React.FC<CustomMessageProps> = ({ type, message, duration = 2000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible) return null;

    return (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white font-semibold text-sm 
            ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-yellow-500"}`}>
            {message}
        </div>
    );
};

export default CustomMessage;
