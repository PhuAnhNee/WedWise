import { useEffect, useState } from 'react';
import AuthService from '../service/AuthService';
import toast from 'react-hot-toast';

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
}

const TherapistPendingBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>('');

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;
  const token = AuthService.getToken();
  const statusMap: Record<number, string> = {
    1: "Đang chờ tư vấn",
    2: "Đã hủy",
    3: "Đã hoàn thành tư vấn",
  };
  
  
  

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
      
          // Lọc chỉ lấy những booking có status = 3 (Đã hoàn thành)
          data = data.filter((booking) => booking.status === 3);
      
          const bookingsWithSchedule = await Promise.all(
            data.map(async (booking) => {
              if (booking.scheduleId) {
                try {
                  const scheduleResponse = await fetch(
                    `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Get_Schedule_By_Id?id=${booking.scheduleId}`,
                    {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    }
                  );
                  const scheduleData = await scheduleResponse.json();
                  return { ...booking, scheduleDate: scheduleData[0]?.date || '' };
                } catch (error) {
                  console.error('Lỗi khi lấy lịch trình:', error);
                  return { ...booking, scheduleDate: '' };
                }
              }
              return booking;
            })
          );
      
          // Sắp xếp theo `scheduleDate` giảm dần (mới nhất lên trên)
          bookingsWithSchedule.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());
      
          setBookings(bookingsWithSchedule);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách booking:', error);
          toast.error('Đã xảy ra lỗi khi lấy danh sách booking!');
        }
      };
      
      fetchBookings();
      
  }, [therapistId, token]);
  const handleGiveFeedback = async (bookingId: string) => {
    const feedbackDescription = prompt('Nhập đánh giá buổi tư vấn');
    console.log('Đang gửi đánh giá với Booking ID:', bookingId, 'Nội dung đánh giá:', feedbackDescription); // Log dữ liệu
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
  
  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Danh sách các Booking</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.bookingId} className="border p-4 rounded-lg shadow-sm relative">
            <h3 className="font-semibold">Booking ID: {booking.bookingId}</h3>
            <p><strong>Member ID:</strong> {booking.memberId}</p>
            <p><strong>Trạng thái:</strong> {statusMap[booking.status] || "Không xác định"}</p>
            <p><strong>Phí:</strong> {booking.fee ? `${booking.fee} VND` : 'Miễn phí'}</p>
            <p><strong>Ngày Booking:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
            <p><strong>Ngày tư vấn:</strong> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleString() : 'Chưa có thông tin'}</p>
            {booking.meetUrl && (
              <div>
                <p><strong>Link tư vấn:</strong> <a href={booking.meetUrl} target="_blank" rel="noopener noreferrer">Join meeting</a></p>
              </div>
            )}

                    <div className="flex space-x-4 mt-4 justify-between">
                      

                      <button
                        onClick={() => handleGiveFeedback(booking.bookingId)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Đánh giá tư vấn
                      </button>
                      
                    </div>


          </div>
         
        ))}
      </div>
    </div>
  );
};

export default TherapistPendingBooking;
