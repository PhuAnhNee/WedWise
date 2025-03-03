import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, DatePicker, Radio, Typography, Avatar, message, Spin,notification } from "antd";
import { PhoneOutlined, MailOutlined, GlobalOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import AuthService from "../service/AuthService"; 
import { useNavigate } from "react-router-dom"; 
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

const TherapistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchTherapist();
  }, [id]);

  const fetchTherapist = async () => {
    setFetchingData(true);
    try {
      const response = await axios.get(`https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id?id=${id}`);
      setTherapist(response.data);
      console.log("Therapist data:", response.data);
    } catch (error) {
      console.error("Error fetching therapist details:", error);
      message.error("Không thể lấy thông tin nhà trị liệu");
    } finally {
      setFetchingData(false);
    }
  };

  const filterSchedulesByDate = (date: Dayjs) => {
    if (!therapist?.schedules) return [];
    return therapist.schedules.filter((s: any) => {
      const scheduleDate = dayjs(s.date).format("YYYY-MM-DD");
      return scheduleDate === date.format("YYYY-MM-DD") && s.isAvailable;
    });
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setSelectedSchedule(null); // Reset selected schedule when date changes
  };
  // ✅ Hàm hiển thị thông báo thành công
const showSuccessNotification = () => {
  api.success({
      message: "Đặt lịch thành công",
      description: "Bạn đã đặt lịch thành công với chuyên gia!",
      icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
      placement: "topRight",
      duration: 3,
      style: {
          backgroundColor: "#f6ffed",
          border: "1px solid #b7eb8f",
      },
  });
};

// ✅ Hàm hiển thị thông báo lỗi
const showErrorNotification = (errorMessage: string) => {
  api.error({
      message: "Đặt lịch thất bại",
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

  // const handleConfirmBooking = async () => {
  //   if (!selectedSchedule) {
  //     message.error("Vui lòng chọn khung giờ trước khi đặt lịch");
  //     return;
  //   }

  //   const decodedToken = AuthService.getDecodedToken();
  //   if (!decodedToken) {
  //     message.error("Bạn cần đăng nhập để đặt lịch");
  //     return;
  //   }

  //   // Kiểm tra xem therapistId thực sự tồn tại trên đối tượng therapist
  //   const therapistId = therapist?.therapistId || id;
    
  //   // Lấy chính xác scheduleId từ đối tượng đã chọn
  //   const scheduleId = selectedSchedule.scheduleId;
    
  //   // Tạo booking data với các trường chính xác
  //   const bookingData = {
  //     memberId: decodedToken.UserId,
  //     therapistId: therapistId,
  //     scheduleId: scheduleId
  //   };

  //   console.log("Booking data:", bookingData);

  //   setLoading(true);
  //   try {
  //     console.log("Token:", AuthService.getToken());
      
  //     // Thử gửi request với cấu trúc dữ liệu khác
  //     const response = await axios({
  //       method: 'post',
  //       url: 'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Create_Booking',
  //       data: bookingData,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${AuthService.getToken()}`
  //       }
  //     });
      
  //     console.log("Booking response:", response.data);
  //     message.success("Đặt lịch thành công!");
      
  //     // Làm mới dữ liệu nhà trị liệu để cập nhật lịch
  //     fetchTherapist();
  //     setSelectedSchedule(null);
  //     setSelectedDate(null);
  //   } catch (error: any) {
  //     console.error("Booking error:", error);
      
  //     // Hiển thị thông tin lỗi chi tiết hơn
  //     if (axios.isAxiosError(error)) {
  //       console.error("Error details:", error.response?.data);
        
  //       // Ghi log toàn bộ response để phân tích sâu hơn
  //       console.error("Full error response:", error.response);
        
  //       const errorMessage = typeof error.response?.data === 'string' 
  //         ? error.response.data 
  //         : error.response?.data?.message || "Đã xảy ra lỗi";
          
  //       message.error(`Đặt lịch thất bại: ${errorMessage}`);
  //     } else {
  //       message.error("Đặt lịch thất bại. Vui lòng thử lại sau.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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

    console.log("Booking data:", bookingData);

    setLoading(true);
    try {
        const response = await axios.post(
            "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Create_Booking",
            JSON.stringify(bookingData),
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${AuthService.getToken()}`,
                },
            }
        );

        console.log("Booking response:", response.data);

        // ✅ Hiển thị thông báo thành công
        showSuccessNotification();

        // ✅ Đợi 2 giây trước khi chuyển trang
        setTimeout(() => {
            navigate("/home/my-booking");
        }, 2000);

    } catch (error: any) {
        console.error("Booking error:", error);
        showErrorNotification("Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
};


  // Hiển thị loading khi đang tải dữ liệu
  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin nhà trị liệu..." />
      </div>
    );
  }

  // Kiểm tra nếu không tìm thấy dữ liệu therapist
  if (!therapist) {
    return <p className="text-center text-red-500">Không tìm thấy thông tin nhà trị liệu!</p>;
  }

  return (
    <>
    {contextHolder}
    <div className="max-w-4xl mx-auto p-6">
      {/* Therapist Info */}
      <Card className="mb-6 shadow-lg">
  <div className="flex flex-col md:flex-row items-center">
    <Avatar size={100} src={therapist.avatar || "default-avatar.png"} />
    <div className="ml-0 md:ml-4 mt-4 md:mt-0 text-center md:text-left">
      <Title level={3}>{therapist.therapistName || "Chuyên gia tư vấn"}</Title>
      <Text className="block mb-2">{therapist.description}</Text>
      <Text type="secondary">Phí tư vấn: <Text type="success">{therapist.consultationFee} VND</Text></Text>
      
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
        {therapist.meetUrl && (
          <Button icon={<GlobalOutlined />} href={therapist.meetUrl} target="_blank">
            Liên kết họp
          </Button>
        )}
      </div>
    </div>
  </div>
   {/* Additional Information */}
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
      
      {/* Debug Info - Uncomment nếu cần debug */}
      {/* <Card className="mb-6">
        <Text strong>Debug Info:</Text>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ 
            therapistId: therapist.therapistId, 
            urlParamId: id,
            schedules: therapist.schedules?.length || 0,
            selectedSchedule: selectedSchedule,
            token: AuthService.getToken()?.substring(0, 20) + '...'
          }, null, 2)}
        </pre>
      </Card> */}
      
      {/* Booking Section */}
      <Card className="shadow-lg">
        <Title level={4}>Chọn ngày</Title>
        <DatePicker 
          className="w-full" 
          onChange={(date) => handleDateChange(date)} 
          value={selectedDate}
          disabledDate={(date) => date.isBefore(dayjs().startOf('day'))}
          placeholder="Chọn ngày tư vấn"
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
                  <Radio.Button 
                    key={schedule.scheduleId} 
                    value={schedule}
                    className="text-center"
                  >
                    {dayjs(schedule.date).format("HH:mm")} - Khung giờ {schedule.slot}
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
          <Button 
            type="default" 
            className="bg-blue-500 text-white"
            size="large"
            block
          >
            Lưu nháp
          </Button>
        </div>
      </Card>
    </div>
    </>
  );
};

export default TherapistDetail;