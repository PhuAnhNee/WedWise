import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "antd";
import axios from "axios";

const API_URL = "https://67b72bdb2bddacfb270df514.mockapi.io/Therapist";

const TherapistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<any>(null);

  useEffect(() => {
    fetchTherapist();
  }, []);

  const fetchTherapist = async () => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      setTherapist(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chuyên gia:", error);
    }
  };

  if (!therapist) {
    return <p className="text-center text-red-500">Không tìm thấy chuyên gia!</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button type="link" onClick={() => navigate(-1)} className="mb-4">
        ← Quay lại
      </Button>

      <div className="border p-6 rounded-lg shadow-lg">
        <img src={therapist.avatar} alt={therapist.name} className="w-32 h-32 rounded-full mx-auto" />
        <h1 className="text-2xl font-bold text-center mt-4">{therapist.name}</h1>
        <p className="text-center text-gray-600">{therapist.specialty}</p>
        <p className="text-center mt-2">{therapist.description}</p>

        <Button type="primary" className="mt-4 w-full" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default TherapistDetail;
