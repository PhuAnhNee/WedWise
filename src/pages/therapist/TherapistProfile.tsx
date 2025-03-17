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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center min-h-screen p-6 bg-gradient-to-r  ">
        <Card
          className="w-full max-w-2xl"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            padding: "24px",
          }}
        >
          {editing ? (
            <Form layout="vertical" form={form} onFinish={handleUpdate} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Chỉnh sửa hồ sơ</h2>
              </div>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Tên trị liệu viên</span>}
                name="therapistName"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input
                  size="large"
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Nhập tên trị liệu viên"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Avatar URL</span>}
                name="avatar"
              >
                <Input
                  size="large"
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Nhập URL avatar"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Mô tả</span>}
                name="description"
              >
                <Input.TextArea
                  size="large"
                  maxLength={100}
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Nhập mô tả"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Phí tư vấn</span>}
                name="consultationFee"
                rules={[{ required: true, message: "Vui lòng nhập phí tư vấn" }]}
              >
                <Input
                  size="large"
                  type="number"
                  prefix="$"
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Nhập phí tư vấn"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">URL cuộc họp</span>}
                name="meetUrl"
              >
                <Input
                  size="large"
                  style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  placeholder="Nhập URL cuộc họp"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-lg text-gray-700 font-medium">Trạng thái</span>}
                name="status"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <div className="flex justify-center space-x-6 mt-8">
                <Button
                  size="large"
                  onClick={() => setEditing(false)}
                  style={{ borderColor: "#d9d9d9", color: "#595959" }}
                >
                  Hủy
                </Button>
                <Button
                  size="large"
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
                    <p className="text-gray-500 text-base">Phí tư vấn</p>
                    <p className="text-gray-900 text-xl font-medium">${profile?.consultationFee}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-md">
                  <LinkOutlined style={{ fontSize: "24px", marginRight: "12px", color: "#595959" }} />
                  <div>
                    <p className="text-gray-500 text-base">Link cuộc họp</p>
                    <a
                      href={profile?.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all text-xl font-medium"
                    >
                      {profile?.meetUrl || "Chưa thiết lập"}
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
                    <p className="text-gray-500 text-base">Trạng thái</p>
                    <p className="text-gray-900 text-xl font-medium">{profile?.status ? "Đang hoạt động" : "Không hoạt động"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Button
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  style={{
                    background: "#595959",
                    color: "#ffffff",
                    borderColor: "#595959",
                    fontWeight: "bold",
                    padding: "0 28px",
                    height: "48px",
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