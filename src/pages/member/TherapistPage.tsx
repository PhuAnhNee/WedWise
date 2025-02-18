import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, message } from "antd";
import therapistsData from "../../data/Therapist.json";

const TherapistPage: React.FC = () => {
  const [therapists, setTherapists] = useState(therapistsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  useEffect(() => {
    const bookedTherapists = JSON.parse(localStorage.getItem("bookings") || "[]");
    const updatedTherapists = therapists.map((t) => ({
      ...t,
      status: bookedTherapists.some((b: any) => b.id === t.id) ? "pending" : "available",
    }));
    setTherapists(updatedTherapists);
  }, []);

  const handleBookAppointment = (therapistId: number) => {
    const updatedTherapists = therapists.map((t) =>
      t.id === therapistId ? { ...t, status: "pending" } : t
    );
    setTherapists(updatedTherapists);

    const selectedTherapist = therapists.find((t) => t.id === therapistId);
    if (selectedTherapist) {
      const bookedTherapists = JSON.parse(localStorage.getItem("bookings") || "[]");
      bookedTherapists.push(selectedTherapist);
      localStorage.setItem("bookings", JSON.stringify(bookedTherapists));
    }

    message.success("Bạn đã đặt lịch thành công!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Danh sách chuyên gia</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên..."
          className="flex-1 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded-lg"
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
        >
          <option value="">Tất cả chuyên môn</option>
          {[...new Set(therapists.map((t) => t.specialty))].map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="p-4 border rounded-lg shadow-lg">
            <img src={therapist.avatar} alt={therapist.name} className="w-24 h-24 rounded-full mx-auto" />
            <h3 className="text-lg font-semibold text-center">{therapist.name}</h3>
            <p className="text-center text-gray-600">{therapist.specialty}</p>

            {/* 🔗 Nút Xem chi tiết */}
            <Link
              to={`/home/therapist/${therapist.id}`}
              className="block mt-2 text-blue-500 text-center hover:underline"
            >
              Xem chi tiết
            </Link>

            {/* 📌 Nút Đặt lịch */}
            {therapist.status === "pending" ? (
              <p className="text-yellow-500 text-center font-semibold">Đang chờ xác nhận</p>
            ) : (
              <Button
                type="primary"
                className="mt-4 w-full"
                onClick={() => handleBookAppointment(therapist.id)}
              >
                Đặt lịch hẹn
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistPage;
