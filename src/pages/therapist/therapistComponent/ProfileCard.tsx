import { useState } from "react"; 
import { Card, Avatar, Button, Form, Input, Switch } from "antd";
import { EditOutlined, SaveOutlined, UserOutlined, DollarOutlined, LinkOutlined } from "@ant-design/icons";
import axios from "axios";
import AuthService from "../../service/AuthService";
import UploadImage from "./UploadImage";

interface TherapistProfile {
  therapistName: string;
  avatar: string;
  description: string;
  consultationFee: number;
  meetUrl: string;
  status: boolean;
}

interface ProfileCardProps {
  profile: TherapistProfile | null;
  setProfile: (profile: TherapistProfile | null) => void;
  therapistId: string | undefined;
  handleFileUpload: (file: File) => Promise<string | null>;
  showNotification: (type: "success" | "error", message: string, description: string) => void;
  message: { text: string; type: string };
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  setProfile,
  therapistId,
  handleFileUpload,
  showNotification,
  message,
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profileForm] = Form.useForm();

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

  return (
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
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {editingProfile ? (
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} className="space-y-6" initialValues={profile || undefined}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Edit Profile</h2>
          </div>

          <Form.Item
            label={<span className="text-lg text-gray-700 font-medium">Profile Picture</span>}
            name="avatar"
          >
            <UploadImage
                imageUrl={profile?.avatar}
                onImageChange={(url) => {
                    profileForm.setFieldsValue({ avatar: url });
                    setProfile(profile ? { ...profile, avatar: url } : null);
                }}
                handleFileUpload={handleFileUpload}
                setIsUploading={setIsUploadingProfile}
                isUploading={isUploadingProfile}
                placeholderText={profile?.therapistName.charAt(0)}
                />
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
              prefix=""
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
                <p className="text-gray-900 text-xl font-medium">{profile?.consultationFee} VND</p>
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
              onClick={() => {
                profileForm.setFieldsValue(profile);
                setEditingProfile(true);
              }}
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
  );
};

export default ProfileCard;