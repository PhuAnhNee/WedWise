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
  schedule?: { date: string; slot: number };
}

interface User {
  userId: string;
  fullName: string;
  isActive: boolean;
  email: string;
  bookings: any[];
}

const TherapistCompleteBooking = () => {
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
    4: "Đã được admin phê duyệt",
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
        data = data.filter((booking) => booking.status === 4);

        // Ánh xạ dữ liệu và lấy tên người dùng
        const bookingsWithSchedule = data.map((booking) => {
          if (booking.scheduleId) {
            try {
              return {
                ...booking,
                scheduleDate: booking.schedule?.date || '',
                slot: booking.schedule?.slot || 0,
                userName: users.find((u) => u.userId === booking.memberId)?.fullName || booking.memberId, // Lấy tên người dùng
              };
            } catch (error) {
              console.error('Lỗi khi lấy lịch trình:', error);
              return { ...booking, scheduleDate: '', slot: 0, userName: booking.memberId };
            }
          }
          return { ...booking, userName: booking.memberId };
        });

        // Sắp xếp theo `scheduleDate` giảm dần (mới nhất lên trên)
        bookingsWithSchedule.sort((a, b) => new Date(b.scheduleDate || '').getTime() - new Date(a.scheduleDate || '').getTime());

        setBookings(bookingsWithSchedule);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách booking:', error);
        toast.error('Đã xảy ra lỗi khi lấy danh sách booking!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users]); // Thêm users vào dependency array để re-fetch khi danh sách người dùng thay đổi

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Danh sách các Booking</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.bookingId} className="border p-4 rounded-lg shadow-sm relative">
            <h3 className="font-semibold">Booking ID: {booking.bookingId}</h3>
            <p><strong>User Name:</strong> {booking.userName || 'Không tìm thấy tên'}</p> {/* Hiển thị tên người dùng thay vì memberId */}
            <p><strong>Trạng thái:</strong> {statusMap[booking.status] || "Không xác định"}</p>
            <p><strong>Phí:</strong> {booking.fee ? `${booking.fee} VND` : 'Miễn phí'}</p>
            <p><strong>Ngày Booking:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
            <p><strong>Ngày tư vấn:</strong> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'Chưa có thông tin'}</p>
            <p><strong>Khoảng thời gian:</strong> {getSlotTime(booking.slot || 0)}</p>
            <div className="flex space-x-4 mt-4 justify-between"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistCompleteBooking;