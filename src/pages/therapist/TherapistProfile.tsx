import { useEffect, useState } from "react";
import { Card, Avatar, Spin, Button, Form, Input, Switch, notification } from "antd";
import { EditOutlined, SaveOutlined, CheckCircleFilled, CloseCircleFilled, UserOutlined, DollarOutlined, LinkOutlined } from "@ant-design/icons";
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
  }, [therapistId, form]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
        <Card 
          className="max-w-lg w-full" 
          style={{ 
            background: "#ffffff", 
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)" 
          }}
        >
          {editing ? (
            <Form 
              layout="vertical" 
              form={form} 
              onFinish={handleUpdate}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa hồ sơ</h2>
              </div>
              
              <Form.Item 
                label={<span className="text-gray-700">Tên trị liệu viên</span>} 
                name="therapistName"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input style={{ borderColor: "#d9d9d9" }} />
              </Form.Item>
              
              <Form.Item 
                label={<span className="text-gray-700">Avatar URL</span>} 
                name="avatar"
              >
                <Input style={{ borderColor: "#d9d9d9" }} />
              </Form.Item>
              
              <Form.Item 
                label={<span className="text-gray-700">Mô tả</span>} 
                name="description"
              >
                <Input.TextArea 
                  maxLength={100} 
                  style={{ borderColor: "#d9d9d9" }} 
                />
              </Form.Item>
              
              <Form.Item 
                label={<span className="text-gray-700">Phí tư vấn</span>} 
                name="consultationFee"
                rules={[{ required: true, message: 'Vui lòng nhập phí tư vấn' }]}
              >
                <Input 
                  type="number" 
                  prefix="$" 
                  style={{ borderColor: "#d9d9d9" }} 
                />
              </Form.Item>
              
              <Form.Item 
                label={<span className="text-gray-700">URL cuộc họp</span>} 
                name="meetUrl"
              >
                <Input style={{ borderColor: "#d9d9d9" }} />
              </Form.Item>
              
              <Form.Item 
                label={<span className="text-gray-700">Trạng thái</span>} 
                name="status" 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <div className="flex space-x-4 justify-center mt-6">
                <Button 
                  onClick={() => setEditing(false)} 
                  style={{ borderColor: "#d9d9d9" }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  style={{ background: "#595959", borderColor: "#595959" }}
                >
                  Lưu
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar 
                    size={120} 
                    src={profile?.avatar} 
                    style={{ border: "4px solid #f0f0f0" }}
                    icon={!profile?.avatar ? <UserOutlined /> : undefined}
                  />
                  <div 
                    className="absolute bottom-0 right-0"
                    style={{ 
                      width: "20px", 
                      height: "20px", 
                      borderRadius: "50%", 
                      background: profile?.status ? "#52c41a" : "#ff4d4f",
                      border: "2px solid #ffffff"
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold mt-4 text-gray-800">{profile?.therapistName}</h2>
                <p className="text-gray-500 mt-2">{profile?.description}</p>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center p-3" style={{ background: "#f5f5f5", borderRadius: "8px" }}>
                  <DollarOutlined style={{ fontSize: "20px", marginRight: "10px", color: "#595959" }} />
                  <div>
                    <p className="text-gray-500 text-sm">Phí tư vấn</p>
                    <p className="text-gray-800 text-lg">${profile?.consultationFee}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3" style={{ background: "#f5f5f5", borderRadius: "8px" }}>
                  <LinkOutlined style={{ fontSize: "20px", marginRight: "10px", color: "#595959" }} />
                  <div>
                    <p className="text-gray-500 text-sm">Link cuộc họp</p>
                    <a 
                      href={profile?.meetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-700 break-all text-lg"
                    >
                      {profile?.meetUrl || "Chưa thiết lập"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center p-3" style={{ background: "#f5f5f5", borderRadius: "8px" }}>
                  <div style={{ 
                    width: "20px", 
                    height: "20px", 
                    borderRadius: "50%", 
                    background: profile?.status ? "#52c41a" : "#ff4d4f",
                    marginRight: "10px"
                  }} />
                  <div>
                    <p className="text-gray-500 text-sm">Trạng thái</p>
                    <p className="text-gray-800 text-lg">{profile?.status ? "Đang hoạt động" : "Không hoạt động"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => setEditing(true)}
                  style={{ 
                    background: "#595959", 
                    color: "#ffffff", 
                    borderColor: "#595959", 
                    fontWeight: "bold",
                    padding: "0 24px",
                    height: "40px"
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default Profile;