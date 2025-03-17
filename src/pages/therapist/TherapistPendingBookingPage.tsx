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
  consultationFee: number | null;
  createdAt: string;
  meetUrl?: string;
  hasFeedback?: boolean;
  scheduleId?: string;
  scheduleDate?: string;
  slot?: number; // Thêm slot vào giao diện Booking
  userName?: string;
  therapist?: { consultationFee: number };
  schedule?: { date: string; slot: number };
}

interface BookingResult {
  bookingResultId: string;
  bookingId: string;
  description: string;
}

interface User {
  userId: string;
  fullName: string;
  isActive: boolean;
  email: string;
  bookings: any[];
}

const TherapistPendingBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>('');
  const [existingBookingIds, setExistingBookingIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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

  const fetchBookingResults = async () => {
    try {
      const response = await fetch(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/BookingResult/Get_All_Booking_Results',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu kết quả booking');
      }

      const data: BookingResult[] = await response.json();
      const bookingIds = data.map((result) => result.bookingId);
      setExistingBookingIds(bookingIds);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kết quả booking:', error);
      toast.error('Đã xảy ra lỗi khi lấy danh sách kết quả booking!');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    fetchBookingResults();
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
        const data: Booking[] = await response.json();
        console.log('Raw API response for bookings:', data);

        const filteredBookings = data.filter((booking) => booking.status === 3);

        const bookingsWithScheduleAndUser = filteredBookings.map((booking) => {
          const user = users.find((u) => u.userId === booking.memberId);
          return {
            ...booking,
            consultationFee: booking.therapist?.consultationFee || null,
            scheduleDate: booking.schedule?.date || '',
            slot: booking.schedule?.slot || 0, // Lấy slot từ schedule
            userName: user ? user.fullName : booking.memberId,
          };
        });

        console.log('Transformed bookings:', bookingsWithScheduleAndUser);
        bookingsWithScheduleAndUser.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());
        setBookings(bookingsWithScheduleAndUser);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách booking:', error);
        toast.error('Đã xảy ra lỗi khi lấy danh sách booking!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users]);

  const handleGiveFeedback = async (bookingId: string) => {
    const feedbackDescription = prompt('Nhập đánh giá buổi tư vấn');
    if (!feedbackDescription) return;

    try {
      const response = await fetch(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/BookingResult/Create_Booking_Result',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: bookingId,
            description: feedbackDescription,
          }),
        }
      );

      if (response.ok) {
        toast.success('Đánh giá thành công!');
        setExistingBookingIds([...existingBookingIds, bookingId]);
        const updatedBookings = bookings.map((booking) =>
          booking.bookingId === bookingId ? { ...booking, hasFeedback: true } : booking
        );
        setBookings(updatedBookings);
      } else {
        throw new Error('Đã xảy ra lỗi khi gửi đánh giá!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  // Hàm để ánh xạ slot với khoảng thời gian
  const getSlotTime = (slot: number) => {
    const slotData = slots.find((s) => s.id === slot.toString());
    return slotData ? slotData.time : 'Không xác định';
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
            <p><strong>Phí:</strong> {booking.consultationFee !== null && booking.consultationFee !== undefined ? `${booking.consultationFee} VND` : 'Miễn phí'}</p>
            <p><strong>Ngày tư vấn:</strong> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'Chưa có thông tin'}</p>
            <p><strong>Khoảng thời gian:</strong> {getSlotTime(booking.slot || 0)}</p>

            <div className="flex space-x-4 mt-4 justify-between">
              {existingBookingIds.includes(booking.bookingId) ? (
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded cursor-not-allowed"
                  disabled
                >
                  Đã hoàn thành đánh giá
                </button>
              ) : (
                <button
                  onClick={() => handleGiveFeedback(booking.bookingId)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Đánh giá tư vấn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistPendingBooking;