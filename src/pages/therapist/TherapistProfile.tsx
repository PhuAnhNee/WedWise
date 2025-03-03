import { useEffect, useState } from "react";
import { Card, Avatar, Spin, Button, Form, Input, Switch, notification } from "antd";
import { EditOutlined, SaveOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
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

const Profile = () => {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!therapistId) {
        showNotification("error", "Lỗi", "Không tìm thấy UserId");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get<TherapistProfile>(
          "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id",
          { params: { id: therapistId } }
        );
        if (data) {
          setProfile(data);
          form.setFieldsValue(data);
        } else {
          showNotification("error", "Lỗi", "Không tìm thấy hồ sơ");
        }
      } catch (error) {
        showNotification("error", "Lỗi", "Không thể tải hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [therapistId]);

  const handleUpdate = async (values: Partial<TherapistProfile>) => {
    const token = AuthService.getToken();
    if (!token) {
      showNotification("error", "Lỗi", "Bạn chưa đăng nhập hoặc token không hợp lệ");
      return;
    }

    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Update_Therapist",
        { therapistId, ...values },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setProfile((prevProfile) => ({ ...prevProfile!, ...values }));
      showNotification("success", "Cập nhật thành công", "Thông tin hồ sơ đã được cập nhật!");
      setEditing(false);
    } catch (error) {
      showNotification("error", "Lỗi", "Không thể cập nhật hồ sơ");
    }
  };

  if (loading) return <Spin size="large" className="flex justify-center items-center h-screen" />;

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center h-full bg-gray-100 p-6">
        <Card className="max-w-lg w-full" hoverable>
          {editing ? (
            <Form layout="vertical" form={form} onFinish={handleUpdate}>
              <Form.Item label="Tên trị liệu viên" name="therapistName">
                <Input />
              </Form.Item>
              <Form.Item label="Avatar URL" name="avatar">
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input.TextArea maxLength={100} />
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