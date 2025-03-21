import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const API_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_All_Therapists";
const SPECIFICATIONS_API = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Specification/Get_All_Specification";
const THERAPIST_BY_NAME_API = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Name?name=";

// Cập nhật interface cho Therapist
interface Therapist {
  therapistId: string;
  therapistName: string;
  description: string;
  avatar?: string;
  consultationFee: number;
  status?: boolean;
  meetUrl?: string;
  schedules?: any[];
  certificates?: any;
}

// Cập nhật interface cho Specification
interface Specification {
  specificationName: string;
  therapists: Therapist[];
}

const TherapistPage: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [allSpecifications, setAllSpecifications] = useState<Specification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecification, setSelectedSpecification] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecifications();
    fetchTherapists();
  }, []);

  // Xử lý tìm kiếm với debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchTherapistsByName(searchTerm);
      } else {
        // Nếu không có search term, hiển thị theo specification đã chọn hoặc tất cả
        filterTherapistsBySpecification(selectedSpecification);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedSpecification]);

  const getAccessToken = () => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      console.error("Unauthorized: No access token found.");
      return null;
    }
    return accessToken;
  };

  // Lấy danh sách specifications và therapists từ API
  const fetchSpecifications = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const response = await axios.get<Specification[]>(SPECIFICATIONS_API, { headers });
      setAllSpecifications(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách specifications:", error);
    }
  };

  const fetchTherapists = async () => {
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;
  
      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const response = await axios.get<Therapist[]>(API_URL, { headers });
  
      // Lọc danh sách chỉ lấy những therapist có status === true
      const activeTherapists = response.data.filter(therapist => therapist.status === true);
      setTherapists(activeTherapists);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên gia:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const fetchTherapistsByName = async (name: string) => {
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const response = await axios.get<Therapist[]>(`${THERAPIST_BY_NAME_API}${encodeURIComponent(name)}`, { headers });
      setTherapists(response.data);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm chuyên gia theo tên:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc therapists dựa trên specification từ dữ liệu đã lấy
  const filterTherapistsBySpecification = (specificationName: string) => {
    if (!specificationName) {
      fetchTherapists(); // Nếu không chọn specification, lấy tất cả
      return;
    }

    const selectedSpec = allSpecifications.find(spec => spec.specificationName === specificationName);
    if (selectedSpec) {
      setTherapists(selectedSpec.therapists);
    } else {
      setTherapists([]);
    }
  };

  const handleSpecificationChange = (specificationName: string) => {
    setSelectedSpecification(specificationName);
    setSearchTerm(""); // Xóa search term khi chọn specification mới
    filterTherapistsBySpecification(specificationName);
    setShowFilterOptions(false);
  };

  const resetFilter = () => {
    setSelectedSpecification("");
    setSearchTerm("");
    fetchTherapists();
    setShowFilterOptions(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getSelectedSpecificationName = () => {
    return selectedSpecification || "Tất cả chuyên môn";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-indigo-800">
          Gặp gỡ các chuyên gia tư vấn của chúng tôi
        </h1>

        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-10">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm chuyên gia theo tên..."
              className="w-full p-3 pl-10 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <div
              className="flex items-center gap-2 p-3 border rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-300"
              onClick={() => setShowFilterOptions(!showFilterOptions)}
            >
              <FilterOutlined className="text-indigo-600" />
              <span className="text-gray-700">{getSelectedSpecificationName()}</span>
            </div>

            {showFilterOptions && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                <div
                  className="p-3 hover:bg-indigo-50 cursor-pointer border-b"
                  onClick={resetFilter}
                >
                  Tất cả chuyên môn
                </div>
                {allSpecifications.map((spec) => (
                  <div
                    key={spec.specificationName}
                    className="p-3 hover:bg-indigo-50 cursor-pointer border-b"
                    onClick={() => handleSpecificationChange(spec.specificationName)}
                  >
                    {spec.specificationName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {!isLoading && therapists.length > 0 && (
          <div className="mb-6 text-center text-gray-600">
            {selectedSpecification && searchTerm && (
              <p>Hiển thị kết quả cho chuyên môn <strong>{getSelectedSpecificationName()}</strong> và tìm kiếm "<strong>{searchTerm}</strong>"</p>
            )}
            {selectedSpecification && !searchTerm && (
              <p>Hiển thị chuyên gia thuộc chuyên môn <strong>{getSelectedSpecificationName()}</strong></p>
            )}
            {!selectedSpecification && searchTerm && (
              <p>Kết quả tìm kiếm cho "<strong>{searchTerm}</strong>"</p>
            )}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {therapists.length === 0 ? (
              <p className="text-center col-span-full text-gray-500">
                Không tìm thấy chuyên gia nào phù hợp.
              </p>
            ) : (
              therapists.map((therapist, index) => (
                <motion.div
                  key={therapist.therapistId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/home/therapist/${therapist.therapistId}`)}
                >
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <img
                        src={therapist.avatar || "default-avatar.png"}
                        alt={therapist.therapistName || "Therapist"}
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                      {therapist.therapistName || therapist.description}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {therapist.description || "Chuyên gia tư vấn hôn nhân và gia đình."}
                    </p>
                    <p className="text-green-600 font-medium mb-4">
                      Phí tư vấn: {therapist.consultationFee?.toLocaleString() || "N/A"} VND
                    </p>

                    <Link
                      to={`/home/therapist/${therapist.therapistId}`}
                      className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistPage;