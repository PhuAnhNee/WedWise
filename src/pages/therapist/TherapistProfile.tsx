import { useEffect, useState, useRef } from "react";
import { Card, Avatar, Spin, Button, Form, Input, Switch, notification } from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  UserOutlined,
  DollarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AuthService from "../service/AuthService";

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
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [api, contextHolder] = notification.useNotification();
  const [profileForm] = Form.useForm();
  const [certificateForm] = Form.useForm();

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const certificateFileInputRef = useRef<HTMLInputElement>(null);

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
      profileForm.setFieldsValue(data);
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
      if (certificateData) {
        certificateForm.setFieldsValue(certificateData);
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      showNotification("error", "Error", "Unable to load certificate");
      setCertificate(null);
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

  const handleFileUpload = async (file: File, isProfile: boolean) => {
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File size exceeds 5MB limit', type: 'error' });
      return null;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Only JPEG, JPG, PNG, and GIF files are allowed', type: 'error' });
      return null;
    }

    const setUploading = isProfile ? setIsUploadingProfile : setIsUploadingCertificate;
    setUploading(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = AuthService.getToken();
      const response = await axios.post<UploadResponse>(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Storage/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.url) {
        setMessage({ text: 'Image uploaded successfully', type: 'success' });
        return response.data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again later.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setMessage({ text: errorMessage, type: 'error' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleProfileAvatarClick = () => {
    if (editingProfile && profileFileInputRef.current) {
      profileFileInputRef.current.click();
    }
  };

  const handleCertificateClick = () => {
    if (editingCertificate && certificateFileInputRef.current) {
      certificateFileInputRef.current.click();
    }
  };

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleFileUpload(file, true);
    if (url) {
      profileForm.setFieldsValue({ avatar: url });
      setProfile((prev) => prev ? { ...prev, avatar: url } : null);
    }
  };

  const handleCertificateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleFileUpload(file, false);
    if (url) {
      certificateForm.setFieldsValue({ certificateUrl: url });
      setCertificate((prev) => prev ? { ...prev, certificateUrl: url } : { certificateId: '', therapistId: therapistId || '', certificateName: '', certificateUrl: url });
    }
  };

  const handleUpdateProfile = async (values: Partial<TherapistProfile>) => {
    const token = AuthService.getToken();
    if (!token) {
      showNotification("error", "Error", "Please log in or invalid token");
      return;
    }
    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Update_Therapist",
        { therapistId, ...values },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const { data: updatedProfile } = await axios.get<TherapistProfile>(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id",
        { params: { id: therapistId } }
      );
      setProfile(updatedProfile);
      profileForm.setFieldsValue(updatedProfile);
      showNotification("success", "Update Successful", "Profile information has been updated!");
      setEditingProfile(false);
    } catch (error) {
      showNotification("error", "Error", "Unable to update profile");
    }
  };

  const handleCreateCertificate = async (values: { certificateName: string; certificateUrl: string }) => {
    const token = AuthService.getToken();
    if (!token || !therapistId) return;
    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Certificate/Create_Certificate",
        { therapistId, ...values },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      await fetchCertificate();
      certificateForm.resetFields();
      setEditingCertificate(false);
      showNotification("success", "Success", "Certificate created successfully!");
    } catch (error) {
      showNotification("error", "Error", "Unable to create certificate");
    }
  };

  const handleUpdateCertificate = async (values: { certificateName: string; certificateUrl: string }) => {
    const token = AuthService.getToken();
    if (!token || !therapistId || !certificate?.certificateId) return;
    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Certificate/Update_Certificate",
        { certificateId: certificate.certificateId, therapistId, ...values },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      await fetchCertificate();
      setEditingCertificate(false);
      showNotification("success", "Success", "Certificate updated successfully!");
    } catch (error) {
      showNotification("error", "Error", "Unable to update certificate");
    }
  };

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
      <div className="flex justify-center items-start min-h-screen p-6 bg-gradient-to-r ">
        {/* Profile Card */}
        <Card
          className="w-full max-w-2xl mr-6"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            padding: "24px",
          }}
        >
          {message.text && (
            <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {editingProfile ? (
            <Form 
              form={profileForm}
              layout="vertical" 
              onFinish={handleUpdateProfile} 
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Edit Profile</h2>
              </div>

              {/* Profile Picture at the top and centered */}
              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Profile Picture</span>}
                name="avatar"
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div 
                      className={`w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative`}
                      onClick={handleProfileAvatarClick}
                    >
                      {isUploadingProfile ? (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      ) : null}
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-400">{profile?.therapistName.charAt(0)}</span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs">Change Photo</span>
                      </div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={profileFileInputRef}
                    className="hidden"
                    accept="image/*" 
                    onChange={handleProfileFileChange}
                  />
                  <Input
                    size="large"
                    style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                    placeholder="Enter avatar URL"
                    onChange={(e) => profileForm.setFieldsValue({ avatar: e.target.value })}
                  />
                </div>
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Full Name</span>}
                name="therapistName"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input size="large" style={{ borderColor: "#d9d9d9", borderRadius: "8px" }} placeholder="Enter therapist name" />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Specialization Description</span>}
                name="description"
              >
                <Input.TextArea
                  size="large"
                  maxLength={100}
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Enter description"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Consultation Fee</span>}
                name="consultationFee"
                rules={[{ required: true, message: "Please enter consultation fee" }]}
              >
                <Input
                  size="large"
                  type="number"
                  prefix="$"
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Enter consultation fee"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Meeting URL</span>}
                name="meetUrl"
              >
                <Input size="large" style={{ borderColor: "#d9d9d9", borderRadius: "8px" }} placeholder="Enter meeting URL" />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Status</span>}
                name="status"
                valuePropName="checked"
              >
                <Switch disabled />
              </Form.Item>

              <div className="flex justify-center space-x-6 mt-8">
                <Button size="large" onClick={() => setEditingProfile(false)} style={{ borderColor: "#d9d9d9", color: "#595959" }}>
                  Cancel
                </Button>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  style={{ background: "#595959", borderColor: "#595959" }}
                >
                  Save
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <Avatar
                    size={150}
                    src={profile?.avatar}
                    style={{ border: "5px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    icon={!profile?.avatar ? <UserOutlined /> : undefined}
                  />
                  <div
                    className="absolute bottom-0 right-0"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: profile?.status ? "#52c41a" : "#ff4d4f",
                      border: "3px solid #ffffff",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </div>
                <h2 className="text-3xl font-extrabold mt-6 text-gray-900">{profile?.therapistName}</h2>
                <p className="text-gray-600 mt-4 text-lg">{profile?.description}</p>
              </div>

              <div className="mt-10 space-y-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-md">
                  <DollarOutlined style={{ fontSize: "24px", marginRight: "12px", color: "#595959" }} />
                  <div>
                    <p className="text-gray-500 text-base">Consultation Fee</p>
                    <p className="text-gray-900 text-xl font-medium">${profile?.consultationFee}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-md">
                  <LinkOutlined style={{ fontSize: "24px", marginRight: "12px", color: "#595959" }} />
                  <div>
                    <p className="text-gray-500 text-base">Meeting Link</p>
                    <a
                      href={profile?.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all text-xl font-medium"
                    >
                      {profile?.meetUrl || "Not set"}
                    </a>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-md">
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: profile?.status ? "#52c41a" : "#ff4d4f",
                      marginRight: "12px",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <div>
                    <p className="text-gray-500 text-base">Status</p>
                    <p className="text-gray-900 text-xl font-medium">{profile?.status ? "Approved" : "Not Approved"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Button
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setEditingProfile(true)}
                  style={{
                    background: "#595959",
                    color: "#ffffff",
                    borderColor: "#595959",
                    fontWeight: "bold",
                    padding: "0 28px",
                    height: "48px",
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Certificate Card */}
        <Card
          className="w-full max-w-md"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            padding: "24px",
            height: "fit-content",
          }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center">Certificate</h2>

          {editingCertificate ? (
            <Form
              form={certificateForm}
              layout="vertical"
              onFinish={certificate ? handleUpdateCertificate : handleCreateCertificate}
              initialValues={certificate || undefined}
              className="space-y-6"
            >
              {/* Certificate Image at the top and centered */}
              <Form.Item
                label={<span className="text-md text-gray-700 font-medium">Certificate Image</span>}
                name="certificateUrl"
                rules={[{ required: true, message: "Please upload or enter certificate URL" }]}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div 
                      className={`w-32 h-32 bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative`}
                      onClick={handleCertificateClick}
                    >
                      {isUploadingCertificate ? (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      ) : null}
                      {certificate?.certificateUrl ? (
                        <img src={certificate.certificateUrl} alt="Certificate" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-400">C</span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs">Change Photo</span>
                      </div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={certificateFileInputRef}
                    className="hidden"
                    accept="image/*" 
                    onChange={handleCertificateFileChange}
                  />
                  <Input
                    size="large"
                    style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                    placeholder="Enter certificate URL"
                    onChange={(e) => certificateForm.setFieldsValue({ certificateUrl: e.target.value })}
                  />
                </div>
              </Form.Item>

              <Form.Item
                label={<span className="text-md text-gray-700 font-medium">Certificate Name</span>}
                name="certificateName"
                rules={[{ required: true, message: "Please enter certificate name" }]}
              >
                <Input size="large" style={{ borderColor: "#d9d9d9", borderRadius: "8px" }} placeholder="Enter certificate name" />
              </Form.Item>

              <div className="flex justify-center space-x-6 mt-4">
                <Button size="large" onClick={() => setEditingCertificate(false)} style={{ borderColor: "#d9d9d9", color: "#595959" }}>
                  Cancel
                </Button>
                <Button size="large" type="primary" htmlType="submit" style={{ background: "#595959", borderColor: "#595959" }}>
                  {certificate ? "Update Certificate" : "Add Certificate"}
                </Button>
              </div>
            </Form>
          ) : certificate ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700 text-lg font-medium">{certificate.certificateName}</p>
              <img
                src={certificate.certificateUrl}
                alt={certificate.certificateName}
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
              />
              <Button
                size="large"
                icon={<EditOutlined />}
                onClick={() => {
                  certificateForm.setFieldsValue(certificate);
                  setEditingCertificate(true);
                }}
                style={{ background: "#595959", color: "#ffffff", borderColor: "#595959" }}
              >
                Update Certificate
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-500">No certificate available</p>
              <Button
                size="large"
                icon={<EditOutlined />}
                onClick={() => {
                  certificateForm.resetFields();
                  setEditingCertificate(true);
                }}
                style={{ background: "#595959", color: "#ffffff", borderColor: "#595959" }}
              >
                Add Certificate
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default Profile;