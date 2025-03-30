import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, DatePicker, Radio, Typography, Avatar, message, Spin, notification, Rate, List } from "antd";
import { PhoneOutlined, MailOutlined, LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import AuthService from "../service/AuthService"; 
import { useNavigate } from "react-router-dom"; 
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface FeedbackData {
  userName: string;
  avatarUrl: string;
  feedbackId: string;
  bookingId: string;
  rating: number;
  feedbackTitle: string;
  feedbackContent: string;
  isSatisfied: boolean;
}

const FeedbackComment: React.FC<{
  author: React.ReactNode;
  avatar: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode[];
}> = ({ author, avatar, content, actions }) => {
  return (
    <div className="flex">
      <div className="mr-4">{avatar}</div>
      <div className="flex-1">
        <div className="mb-1">{author}</div>
        <div className="mb-2">{content}</div>
        {actions && <div className="flex gap-4">{actions}</div>}
      </div>
    </div>
  );
};

const TherapistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
  const [avgRating, setAvgRating] = useState<number>(0);

  useEffect(() => {
    fetchTherapist();
    if (id) fetchFeedbacks(id);
  }, [id]);

  const fetchTherapist = async () => {
    setFetchingData(true);
    try {
      const response = await axios.get(`https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id?id=${id}`);
      setTherapist(response.data);
    } catch (error) {
      console.error("Error fetching therapist details:", error);
      message.error("Không thể lấy thông tin nhà trị liệu");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchFeedbacks = async (therapistId: string) => {
    setFeedbackLoading(true);
    try {
      const response = await axios.get(`https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Feedback/Get_Feedback_By_TherapistId?id=${therapistId}`);
      setFeedbacks(response.data);
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum: number, item: FeedbackData) => sum + item.rating, 0);
        setAvgRating(totalRating / response.data.length);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      message.error("Không thể lấy đánh giá của nhà trị liệu");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getSlotStartTime = (slot: number) => {
    switch (slot) {
      case 1: return { hour: 7, minute: 30 };
      case 2: return { hour: 9, minute: 30 };
      case 3: return { hour: 11, minute: 30 };
      case 4: return { hour: 13, minute: 30 };
      case 5: return { hour: 15, minute: 30 };
      case 6: return { hour: 17, minute: 30 };
      case 7: return { hour: 19, minute: 30 };
      default: return { hour: 0, minute: 0 };
    }
  };

  const isSlotPassed = (date: Dayjs, slot: number) => {
    const now = dayjs();
    const today = now.format("YYYY-MM-DD");
    const scheduleDate = date.format("YYYY-MM-DD");
    if (scheduleDate !== today) return false;
    const slotTime = getSlotStartTime(slot);
    const slotDateTime = dayjs().hour(slotTime.hour).minute(slotTime.minute).second(0);
    return now.isAfter(slotDateTime);
  };

  const filterSchedulesByDate = (date: Dayjs) => {
    if (!therapist?.schedules) return [];
    return therapist.schedules.filter((s: any) => {
      const scheduleDate = dayjs(s.date).format("YYYY-MM-DD");
      return scheduleDate === date.format("YYYY-MM-DD") && s.status === 0 && !isSlotPassed(date, s.slot);
    });
  };

  const getTimeRangeBySlot = (slot: number) => {
    switch (slot) {
      case 1: return "7:30 - 9:00";
      case 2: return "9:30 - 11:00";
      case 3: return "11:30 - 13:00";
      case 4: return "13:30 - 15:00";
      case 5: return "15:30 - 17:00";
      case 6: return "17:30 - 19:00";
      case 7: return "19:30 - 21:00";
      default: return `Slot ${slot}`;
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setSelectedSchedule(null);
  };

  const showSuccessNotification = () => {
    api.success({
      message: "Đặt lịch thành công",
      description: "Bạn đã đặt lịch thành công với chuyên gia!",
      icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
      placement: "topRight",
      duration: 3,
      style: { backgroundColor: "#f6ffed", border: "1px solid #b7eb8f" },
    });
  };

  const showErrorNotification = (errorMessage: string) => {
    api.error({
      message: "Đặt lịch thất bại",
      description: errorMessage,
      icon: <CloseCircleFilled style={{ color: "#ff4d4f" }} />,
      placement: "topRight",
      duration: 4,
      style: { backgroundColor: "#fff2f0", border: "1px solid #ffccc7" },
    });
  };

  const handleConfirmBooking = async () => {
    if (!selectedSchedule) {
      showErrorNotification("Vui lòng chọn khung giờ trước khi đặt lịch.");
      return;
    }
    const decodedToken = AuthService.getDecodedToken();
    if (!decodedToken) {
      showErrorNotification("Bạn cần đăng nhập để đặt lịch.");
      return;
    }
    const therapistId = therapist?.therapistId || id;
    const scheduleId = selectedSchedule.scheduleId;
    const bookingData = {
      memberId: decodedToken.UserId,
      therapistId: therapistId,
      scheduleId: scheduleId,
    };
    setLoading(true);
    try {
      const response = await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Create_Booking",
        JSON.stringify(bookingData),
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${AuthService.getToken()}` } }
      );
      console.log(response);
      
      showSuccessNotification();
      setTimeout(() => {
        navigate("/home/my-booking");
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Booking error:", error);
      showErrorNotification("Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const hasAvailableSchedules = (date: Dayjs) => filterSchedulesByDate(date).length > 0;

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin nhà trị liệu..." />
      </div>
    );
  }

  if (!therapist) {
    return <p className="text-center text-red-500">Không tìm thấy thông tin nhà trị liệu!</p>;
  }

  return (
    <>
      {contextHolder}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Therapist Info and Booking */}
        <div className="md:col-span-2">
          {/* Therapist Info */}
          <Card className="mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <Avatar size={100} src={therapist.avatar || "default-avatar.png"} />
              <div className="ml-0 md:ml-4 mt-4 md:mt-0 text-center md:text-left">
                <Title level={3}>{therapist.therapistName || "Chuyên gia tư vấn"}</Title>
                <div className="flex items-center mb-2 justify-center md:justify-start">
                  <Rate disabled defaultValue={avgRating} allowHalf />
                  <Text className="ml-2">({feedbacks.length} đánh giá)</Text>
                </div>
                <Text className="block mb-2">{therapist.description}</Text>
                <Text type="secondary">Phí tư vấn: <Text type="success">{therapist.consultationFee?.toLocaleString() || "N/A"} VND</Text></Text>
                {therapist.specialty && therapist.specialty.length > 0 && (
                  <div className="mt-2">
                    <Text strong>Chuyên môn:</Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {therapist.specialty.map((spec: any, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {spec.name || "Chuyên môn " + (index + 1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                  <Button type="primary" icon={<PhoneOutlined />}> Gọi điện</Button>
                  <Button icon={<MailOutlined />}>Gửi email</Button>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text strong>Trạng thái:</Text>
                  <Text className="ml-2">{therapist.status ? "Đang hoạt động" : "Không hoạt động"}</Text>
                </div>
                {therapist.createdAt && (
                  <div>
                    <Text strong>Tham gia từ:</Text>
                    <Text className="ml-2">{dayjs(therapist.createdAt).format("DD/MM/YYYY")}</Text>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Booking Card */}
          <Card className="shadow-lg">
            <Title level={4}>Chọn ngày</Title>
            <DatePicker 
              className="w-full"
              onChange={handleDateChange} 
              value={selectedDate}
              disabledDate={(date) => date.isBefore(dayjs().startOf("day"))}
              placeholder="Chọn ngày tư vấn"
              dateRender={(current) => {
                const hasAvailable = hasAvailableSchedules(current);
                return (
                  <div className={`relative flex justify-center items-center ${hasAvailable ? 'bg-green-50' : ''}`}>
                    <div className="ant-picker-cell-inner">{current.date()}</div>
                    {hasAvailable && <span className="absolute bottom-1 w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                );
              }}
            />
            {selectedDate && (
              <>
                <Title level={4} className="mt-4">Chọn giờ</Title>
                {filterSchedulesByDate(selectedDate).length > 0 ? (
                  <Radio.Group 
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-2" 
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                  >
                    {filterSchedulesByDate(selectedDate).map((schedule: any) => (
                      <Radio.Button key={schedule.scheduleId} value={schedule} className="text-center">
                        {getTimeRangeBySlot(schedule.slot)}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                ) : (
                  <div className="text-center text-red-500 my-4 p-4 border border-red-200 rounded-md bg-red-50">
                    Không có lịch trống cho ngày này. Vui lòng chọn ngày khác.
                  </div>
                )}
              </>
            )}
            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2">
              <Button 
                type="primary" 
                className="bg-green-500"
                size="large"
                block
                onClick={handleConfirmBooking}
                loading={loading}
                disabled={!selectedSchedule}
              >
                {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Feedback Section */}
        <div className="md:col-span-1">
          <Card className="shadow-lg sticky top-6">
            <Title level={4}>Đánh giá từ người dùng</Title>
            <div className="mb-4 flex items-center">
              <div className="mr-4">
                <Text strong className="text-lg">{avgRating.toFixed(1)}</Text>
                <Rate disabled defaultValue={avgRating} allowHalf />
              </div>
              <div>
                <Text>Dựa trên {feedbacks.length} đánh giá</Text>
              </div>
            </div>
            {feedbackLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spin tip="Đang tải đánh giá..." />
              </div>
            ) : feedbacks.length > 0 ? (
              <List
                className="mt-4"
                itemLayout="horizontal"
                dataSource={feedbacks}
                renderItem={(item: FeedbackData) => (
                  <List.Item>
                    <FeedbackComment
                      author={<Text strong>{item.userName}</Text>}
                      avatar={<Avatar src={item.avatarUrl} alt={item.userName} />}
                      content={
                        <div>
                          <div className="flex items-center mb-2">
                            <Rate disabled defaultValue={item.rating} />
                            <Text className="ml-2 font-medium" type="success">{item.feedbackTitle}</Text>
                          </div>
                          <Paragraph>{item.feedbackContent}</Paragraph>
                        </div>
                      }
                      actions={[
                        <div key="sentiment">
                          {item.isSatisfied ? (
                            <span className="text-green-500 flex items-center">
                              <LikeOutlined className="mr-1" /> Hài lòng
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <DislikeOutlined className="mr-1" /> Không hài lòng
                            </span>
                          )}
                        </div>
                      ]}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="py-4 text-center">
                <Text type="secondary">Chưa có đánh giá nào cho nhà trị liệu này.</Text>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default TherapistDetail;