import { useEffect, useState } from "react";
import { Card, Avatar, Spin, Button, Form, Input, Switch, notification } from "antd";
import { EditOutlined, SaveOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import axios from "axios";
import AuthService from "../service/AuthService";

interface TherapistProfile {
  therapistName?: string;
  avatar?: string;
  description?: string;
  consultationFee?: number;
  meetUrl?: string;
  status?: boolean;
}

const Profile = () => {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [api, contextHolder] = notification.useNotification();
  const [descriptionLength, setDescriptionLength] = useState<number>(0); // Thêm state để đếm số kí tự

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;

  const showSuccessNotification = () => {
    api.success({
      message: "Cập nhật thành công",
      description: "Thông tin hồ sơ đã được cập nhật thành công!",
      icon: <CheckCircleFilled style={{ color: "#52c41a" }} />, 
      placement: "topRight",
      duration: 3,
      style: {
        backgroundColor: "#f6ffed",
        border: "1px solid #b7eb8f",
      },
    });
  };

  const showErrorNotification = (errorMessage: string) => {
    api.error({
      message: "Cập nhật thất bại",
      description: errorMessage,
      icon: <CloseCircleFilled style={{ color: "#ff4d4f" }} />, 
      placement: "topRight",
      duration: 4,
      style: {
        backgroundColor: "#fff2f0",
        border: "1px solid #ffccc7",
      },
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!therapistId) {
        showErrorNotification("Không tìm thấy UserId");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id?id=${therapistId}`
        );

        if (response.data) {
          setProfile(response.data);
        } else {
          showErrorNotification("Không tìm thấy hồ sơ");
        }
      } catch (error) {
        console.error("Lỗi khi lấy hồ sơ:", error);
        showErrorNotification("Không thể tải hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [therapistId]);

  const handleUpdate = async (values: TherapistProfile) => {
    const token = AuthService.getToken();

    if (!token) {
      showErrorNotification("Bạn chưa đăng nhập hoặc token không hợp lệ");
      return;
    }

    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Update_Therapist",
        { therapistId, ...values },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      showSuccessNotification();
      setProfile((prevProfile) => ({ ...prevProfile!, ...values }));
      setEditing(false);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showErrorNotification("Không thể cập nhật hồ sơ");
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionLength(e.target.value.length);
  };

  if (loading) return <Spin size="large" className="flex justify-center items-center h-screen" />;

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center h-full bg-gray-100 p-6">
        <Card className="max-w-lg w-full" hoverable>
          {editing ? (
            <Form layout="vertical" initialValues={profile || {}} onFinish={handleUpdate}>
              <Form.Item label="Avatar URL" name="avatar">
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input.TextArea 
                  onChange={handleDescriptionChange} 
                  maxLength={100} 
                />
                <div className="text-right text-sm text-gray-500">{descriptionLength}/100</div> 
              </Form.Item>
              <Form.Item label="Consultation Fee" name="consultationFee">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Meet URL" name="meetUrl">
                <Input />
              </Form.Item>
              <Form.Item label="Status" name="status" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Lưu</Button>
            </Form>
          ) : (
            <>
              <div className="text-center">
                <Avatar size={100} src={profile?.avatar} />
                <h2 className="text-2xl font-bold mt-4">{profile?.therapistName}</h2>
                <p className="text-gray-600 mt-2">{profile?.description}</p>
              </div>
              <div className="mt-6">
                <p><strong>Trạng thái:</strong> {profile?.status ? "Hoạt động" : "Không hoạt động"}</p>
                <p><strong>Phí tư vấn:</strong> ${profile?.consultationFee}</p>
                <p><strong>Meet URL:</strong> <a href={profile?.meetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">Tham gia cuộc họp</a></p>
              </div>
              <div className="mt-6 text-center">
                <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>Chỉnh sửa hồ sơ</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default Profile;
