import { useState } from "react";
import TherapistAllBookings from "./TherapistAllBookings.tsx";
import TherapistBookingList from "./TherapistBookingList.tsx";
import TherapistPendingBooking from "./TherapistPendingBookingPage.tsx"; // Sửa tên file nếu cần
import TherapistCompleteBooking from "./TherapistCompleteBooking.tsx";

const TherapistBookingDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return <TherapistAllBookings />; // Hiển thị tất cả bookings
      case "ongoing":
        return <TherapistBookingList />; // Hiển thị bookings status 1
      case "pendingFeedback":
        return <TherapistPendingBooking />; // Hiển thị bookings status 3
      case "completed":
        return <TherapistCompleteBooking />; // Hiển thị bookings status 4
      default:
        return <TherapistAllBookings />;
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Therapist Booking Dashboard
        </h2>

        {/* Tab Bar */}
        <div className="flex border-b mb-6">
          {[
            { id: "all", label: "All Bookings" },
            { id: "ongoing", label: "Ongoing Bookings" },
            { id: "pendingFeedback", label: "Pending Feedback" },
            { id: "completed", label: "Completed Bookings" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default TherapistBookingDashboard;