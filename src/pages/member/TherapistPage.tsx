import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_All_Therapists";

const TherapistPage: React.FC = () => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Danh sách chuyên gia</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo mô tả..."
          className="flex-1 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {therapists.map((therapist) => (
          <div key={therapist.therapistId} className="p-4 border rounded-lg shadow-lg">
            <img src={therapist.avatar || "default-avatar.png"} alt="Therapist" className="w-24 h-24 rounded-full mx-auto" />
            <h3 className="text-lg font-semibold text-center">Mô tả: {therapist.description}</h3>
            <p className="text-center text-gray-600">Giá tư vấn: {therapist.consultationFee} VND</p>

            <Link
              to={`/home/therapist/${therapist.therapistId}`}
              className="block mt-2 text-blue-500 text-center hover:underline"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistPage;
