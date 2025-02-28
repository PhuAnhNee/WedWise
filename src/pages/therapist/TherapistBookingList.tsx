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
}

const TherapistBookingList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>('');

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;
  const token = AuthService.getToken();

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
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách booking:', error);
        toast.error('Đã xảy ra lỗi khi lấy danh sách booking!');
      }
    };

    fetchBookings();
  }, [therapistId, token]);

  const handleStartConsultation = async (bookingId: string) => {
    console.log('Đang gửi yêu cầu bắt đầu tư vấn với Booking ID:', bookingId); // Log dữ liệu
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
      const updatedBookings = bookings.map((booking) =>
        booking.bookingId === bookingId ? { ...booking, meetUrl: data.meetUrl } : booking
      );
      setBookings(updatedBookings);
      toast.success('Đã bắt đầu tư vấn. Link: ' + data.meetUrl);
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi bắt đầu tư vấn!');
    }
  };
  
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
  
  const handleEndConsultation = async (bookingId: string) => {
    console.log('Đang gửi yêu cầu kết thúc tư vấn với Booking ID:', bookingId); // Log dữ liệu
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Close_Booking?id=${bookingId}`,
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
    console.log('Đang gửi yêu cầu hủy booking với Booking ID:', bookingId); // Log dữ liệu
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
            <p><strong>Member ID:</strong> {booking.memberId}</p>
            <p><strong>Trạng thái:</strong> {booking.status === 1 ? 'Đã xác nhận' : 'Chưa xác nhận'}</p>
            <p><strong>Phí:</strong> {booking.fee ? `${booking.fee} VND` : 'Miễn phí'}</p>
            <p><strong>Ngày tạo:</strong> {new Date(booking.createdAt).toLocaleString()}</p>

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
                        onClick={() => handleGiveFeedback(booking.bookingId)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Đánh giá tư vấn
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
