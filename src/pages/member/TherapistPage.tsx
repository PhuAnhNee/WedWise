import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion"; // Thêm framer-motion để tạo animation
import { SearchOutlined } from "@ant-design/icons"; // Icon tìm kiếm

const API_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_All_Therapists";

interface Therapist {
  therapistId: string;
  therapistName: string;
  description: string;
  avatar?: string;
  consultationFee: number;
}

const TherapistPage: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Unauthorized: No access token found.");
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const response = await axios.get<Therapist[]>(API_URL, { headers });
      setTherapists(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên gia:", error);
    }
  };

  // Lọc danh sách chuyên gia theo từ khóa tìm kiếm
  const filteredTherapists = therapists.filter((therapist) =>
    therapist.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tiêu đề */}
        <h1 className="text-4xl font-bold text-center mb-10 text-indigo-800">
          Gặp gỡ các chuyên gia tư vấn của chúng tôi
        </h1>

        {/* Tìm kiếm */}
        <div className="relative max-w-lg mx-auto mb-10">
          <input
            type="text"
            placeholder="Tìm kiếm chuyên gia theo mô tả..."
            className="w-full p-3 pl-10 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Danh sách chuyên gia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTherapists.length === 0 ? (
            <p className="text-center col-span-full text-gray-500">
              Không tìm thấy chuyên gia nào phù hợp.
            </p>
          ) : (
            filteredTherapists.map((therapist, index) => (
              <motion.div
                key={therapist.therapistId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/home/therapist/${therapist.therapistId}`)}
              >
                <div className="p-6 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <img
                      src={therapist.avatar || "default-avatar.png"}
                      alt={therapist.therapistName || "Therapist"}
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Thông tin chuyên gia */}
                  <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                    {therapist.therapistName || therapist.description}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {therapist.description || "Chuyên gia tư vấn hôn nhân và gia đình."}
                  </p>
                  <p className="text-green-600 font-medium mb-4">
                    Phí tư vấn: {therapist.consultationFee?.toLocaleString() || "N/A"} VND
                  </p>

                  {/* Nút Xem chi tiết */}
                  <Link
                    to={`/home/therapist/${therapist.therapistId}`}
                    className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
                    onClick={(e) => e.stopPropagation()} // Ngăn click trên Link kích hoạt navigate của card
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistPage;