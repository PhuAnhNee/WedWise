import { useEffect, useState } from 'react';
import AuthService from '../service/AuthService';
import toast from 'react-hot-toast';

interface Slot {
  id: string;
  time: string;
}

interface Booking {
  bookingId: string;
  memberId: string;
  status: number;
  fee: number | null;
  createdAt: string;
  meetUrl?: string;
  hasFeedback?: boolean;
  scheduleId?: string;
  scheduleDate?: string;
  slot?: number; // Thêm slot vào giao diện Booking
  userName?: string; // Thêm userName để hiển thị tên người dùng
  schedule?: { date: string; slot: number }; // Thêm kiểu cho schedule
}

interface User {
  userId: string;
  fullName: string;
  isActive: boolean;
  email: string;
  bookings: any[];
}

const TherapistBookingList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]); // Thêm state để lưu danh sách người dùng

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;
  const token = AuthService.getToken();
  const statusMap: Record<number, string> = {
    1: "Đang chờ tư vấn",
    2: "Đã hủy",
    3: "Đã hoàn thành tư vấn",
  };

  const slots: Slot[] = [
    { id: "1", time: "Bắt đầu 7:30 - Kết thúc 9:00" },
    { id: "2", time: "Bắt đầu 9:30 - Kết thúc 11:00" },
    { id: "3", time: "Bắt đầu 11:30 - Kết thúc 13:00" },
    { id: "4", time: "Bắt đầu 13:30 - Kết thúc 15:00" },
    { id: "5", time: "Bắt đầu 15:30 - Kết thúc 17:00" },
    { id: "6", time: "Bắt đầu 17:30 - Kết thúc 19:00" },
    { id: "7", time: "Bắt đầu 19:30 - Kết thúc 21:00" },
  ];

  // Hàm để ánh xạ slot với khoảng thời gian
  const getSlotTime = (slot: number) => {
    const slotData = slots.find((s) => s.id === slot.toString());
    return slotData ? slotData.time : 'Không xác định';
  };

  // Fetch danh sách người dùng
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Account/Get_All_Users',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách người dùng');
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      toast.error('Đã xảy ra lỗi khi lấy danh sách người dùng!');
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch danh sách người dùng khi component mount
  }, [token]);

  useEffect(() => {
    if (!therapistId || !token) {
      setError('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Get_Booking_By_Therapist_Id?id=${therapistId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        let data: Booking[] = await response.json();
        data = data.filter((booking) => booking.status === 1);

        // Ánh xạ dữ liệu và lấy tên người dùng
        const bookingsWithSchedule = data.map((booking) => {
          if (booking.scheduleId) {
            try {
              return {
                ...booking,
                scheduleDate: booking.schedule?.date || '',
                slot: booking.schedule?.slot || 0, // Lấy slot từ schedule
                userName: users.find((u) => u.userId === booking.memberId)?.fullName || booking.memberId, // Lấy tên người dùng
              };
            } catch (error) {
              console.error('Lỗi khi lấy lịch trình:', error);
              return { ...booking, scheduleDate: '', slot: 0, userName: booking.memberId };
            }
          }
          return { ...booking, userName: booking.memberId };
        });

        setBookings(bookingsWithSchedule);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách booking:', error);
        toast.error('Đã xảy ra lỗi khi lấy danh sách booking!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users]); // Thêm users vào dependency array

  const handleStartConsultation = async (bookingId: string) => {
    console.log('Đang xử lý yêu cầu bắt đầu tư vấn với Booking ID:', bookingId);
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id?id=${therapistId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      const meetUrl = data.meetUrl;

      if (meetUrl) {
        // Cập nhật meetUrl cho booking tương ứng
        const updatedBookings = bookings.map((booking) =>
          booking.bookingId === bookingId ? { ...booking, meetUrl } : booking
        );
        setBookings(updatedBookings);
        // Mở link meetUrl trong tab mới
        window.open(meetUrl, '_blank');
        toast.success('Đã bắt đầu tư vấn. Vui lòng kiểm tra tab mới!');
      } else {
        toast.error('Không tìm thấy link tư vấn!');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi bắt đầu tư vấn!');
    }
  };

  const handleEndConsultation = async (bookingId: string) => {
    console.log('Đang gửi yêu cầu kết thúc tư vấn với Booking ID:', bookingId);
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Finish_Booking/?id=${bookingId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Kết thúc tư vấn thành công!');
        const updatedBookings = bookings.filter((booking) => booking.bookingId !== bookingId);
        setBookings(updatedBookings);
      } else {
        throw new Error('Đã xảy ra lỗi khi kết thúc tư vấn!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    console.log('Đang gửi yêu cầu hủy booking với Booking ID:', bookingId);
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Cancel_Booking?id=${bookingId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Đã hủy booking thành công!');
        const updatedBookings = bookings.filter((booking) => booking.bookingId !== bookingId);
        setBookings(updatedBookings);
      } else {
        throw new Error('Đã xảy ra lỗi khi hủy booking!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Danh sách các Booking</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.bookingId} className="border p-4 rounded-lg shadow-sm relative">
            <h3 className="font-semibold">Booking ID: {booking.bookingId}</h3>
            <p><strong>User Name:</strong> {booking.userName || 'Không tìm thấy tên'}</p>
            <p><strong>Trạng thái:</strong> {statusMap[booking.status] || "Không xác định"}</p>
            <p><strong>Phí:</strong> {booking.fee ? `${booking.fee} VND` : 'Miễn phí'}</p>
            <p><strong>Ngày tư vấn:</strong> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'Chưa có thông tin'}</p>
            <p><strong>Khoảng thời gian:</strong> {getSlotTime(booking.slot || 0)}</p>
            {booking.meetUrl && (
              <div>
                <p><strong>Link tư vấn:</strong> <a href={booking.meetUrl} target="_blank" rel="noopener noreferrer">Join meeting</a></p>
              </div>
            )}
            <div className="flex space-x-4 mt-4 justify-between">
              <button
                onClick={() => handleStartConsultation(booking.bookingId)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Bắt đầu tư vấn
              </button>
              <button
                onClick={() => handleEndConsultation(booking.bookingId)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Kết thúc tư vấn
              </button>
              <button
                onClick={() => handleCancelBooking(booking.bookingId)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Hủy Booking
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistBookingList;