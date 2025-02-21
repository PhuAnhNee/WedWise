import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, message } from "antd";
import axios from "axios";

const API_URL = "https://67b72bdb2bddacfb270df514.mockapi.io/Therapist";

const TherapistPage: React.FC = () => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await axios.get(API_URL);
      setTherapists(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên gia:", error);
    }
  };

  const handleBookAppointment = async (therapistId: number) => {
    try {
      await axios.put(`${API_URL}/${therapistId}`, { status: true });
      fetchTherapists();
      message.success("Bạn đã đặt lịch thành công!");
    } catch (error) {
      message.error("Đặt lịch thất bại. Vui lòng thử lại!");
    }
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

            <Link
              to={`/home/therapist/${therapist.id}`}
              className="block mt-2 text-blue-500 text-center hover:underline"
            >
              Xem chi tiết
            </Link>

            {therapist.status ? (
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
