import { useEffect, useState } from "react";
import { Spin, notification } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import axios from "axios";
import AuthService from "../service/AuthService";
import ProfileCard from "./therapistComponent/ProfileCard";
import CertificateCard from "./therapistComponent/CertificateCard";
import SpecificationList from "./therapistComponent/SpecificationList";

interface TherapistProfile {
  therapistName: string;
  avatar: string;
  description: string;
  consultationFee: number;
  meetUrl: string;
  status: boolean;
}

interface Certificate {
  certificateId: string;
  therapistId: string;
  certificateName: string;
  certificateUrl: string;
}

interface UploadResponse {
  url: string;
  message: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [api, contextHolder] = notification.useNotification();

  const currentUser = AuthService.getCurrentUser();
  const therapistId = currentUser?.UserId;

  const showNotification = (type: "success" | "error", message: string, description: string) => {
    api[type]({
      message,
      description,
      icon: type === "success" ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#ff4d4f" }} />,
      placement: "topRight",
      duration: 3,
    });
  };

  const fetchProfile = async () => {
    if (!therapistId) {
      showNotification("error", "Error", "UserId not found");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get<TherapistProfile>(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id",
        { params: { id: therapistId } }
      );
      setProfile(data);
    } catch (error) {
      showNotification("error", "Error", "Unable to load profile");
    }
  };

  const fetchCertificate = async () => {
    if (!therapistId) {
      console.log("No therapistId available");
      return;
    }
    try {
      const { data } = await axios.get(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Certificate/Get_Certificate_By_Therapist_Id?id=${therapistId}`,
        { headers: { Authorization: `Bearer ${AuthService.getToken()}` } }
      );
      const certificateData = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data || null;
      setCertificate(certificateData);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      showNotification("error", "Error", "Unable to load certificate");
      setCertificate(null);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size exceeds 5MB limit", type: "error" });
      return null;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: "Only JPEG, JPG, PNG, and GIF files are allowed", type: "error" });
      return null;
    }

    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = AuthService.getToken();
      const response = await axios.post<UploadResponse>(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Storage/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.url) {
        setMessage({ text: "Image uploaded successfully", type: "success" });
        return response.data.url;
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      let errorMessage = "Failed to upload image. Please try again later.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setMessage({ text: errorMessage, type: "error" });
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchCertificate()]);
      setLoading(false);
    };
    fetchData();
  }, [therapistId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex flex-col md:flex-row justify-center items-start min-h-screen p-6 bg-gradient-to-r gap-6">
        <ProfileCard
          profile={profile}
          setProfile={setProfile}
          therapistId={therapistId}
          handleFileUpload={handleFileUpload}
          showNotification={showNotification}
          message={message}
        />
        <div className="flex flex-col gap-6">
          <CertificateCard
            certificate={certificate}
            setCertificate={setCertificate}
            therapistId={therapistId}
            fetchCertificate={fetchCertificate}
            handleFileUpload={handleFileUpload}
            showNotification={showNotification}
          />
          {therapistId ? (
            <SpecificationList
              therapistId={therapistId}
              showNotification={showNotification}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <p className="text-red-500">Therapist ID is not available.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;