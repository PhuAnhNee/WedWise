import { useEffect, useState } from 'react';
import AuthService from '../service/AuthService';
import toast, { Toaster } from 'react-hot-toast';

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
  slot?: number;
  userName?: string;
  therapist?: { consultationFee: number };
  schedule?: { date: string; slot: number };
  isOngoing?: boolean;
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
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;
  const token = AuthService.getToken();

  const statusMap: Record<number, string> = {
    1: "Pending Consultation",
    2: "Cancelled",
    3: "Completed Consultation",
  };

  const slots: Slot[] = [
    { id: "1", time: "7:30 - 9:00" },
    { id: "2", time: "9:30 - 11:00" },
    { id: "3", time: "11:30 - 13:00" },
    { id: "4", time: "13:30 - 15:00" },
    { id: "5", time: "15:30 - 17:00" },
    { id: "6", time: "17:30 - 19:00" },
    { id: "7", time: "19:30 - 21:00" },
  ];

  const getSlotTime = (slot: number) => {
    const slotData = slots.find((s) => s.id === slot.toString());
    return slotData ? slotData.time : 'Unknown';
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Account/Get_All_Users',
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Unable to fetch user list');
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Error fetching user list!');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!therapistId || !token) {
      setError('You are not logged in or your session has expired!');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Get_Booking_By_Therapist_Id?id=${therapistId}`,
          {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        let data: Booking[] = await response.json();
        data = data.filter((booking) => booking.status === 1);

        const bookingsWithSchedule = data.map((booking) => ({
          ...booking,
          fee: booking.therapist?.consultationFee || null,
          scheduleDate: booking.schedule?.date || '',
          slot: booking.schedule?.slot || 0,
          userName: users.find((u) => u.userId === booking.memberId)?.fullName || booking.memberId,
          isOngoing: false,
        }));

        setBookings(bookingsWithSchedule);
      } catch (error) {
        toast.error('Error fetching bookings!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users]);

  const handleStartConsultation = async (bookingId: string) => {
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id?id=${therapistId}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const data = await response.json();
      const meetUrl = data.meetUrl;

      if (meetUrl) {
        const updatedBookings = bookings.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, meetUrl, isOngoing: true }
            : booking
        );
        setBookings(updatedBookings);
        window.open(meetUrl, '_blank');
        toast.success('Consultation started. Check the new tab!');
      } else {
        toast.error('No consultation link found!');
      }
    } catch (error) {
      toast.error('Error starting consultation!');
    }
  };

  const handleEndConsultation = async (bookingId: string) => {
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Finish_Booking/?id=${bookingId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success('Consultation ended successfully!');
        const updatedBookings = bookings.filter((booking) => booking.bookingId !== bookingId);
        setBookings(updatedBookings);
      } else {
        throw new Error('Error ending consultation!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error occurred, please try again!');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Cancel_Booking`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookingId: bookingId,
            isReturn: true
          })
        }
      );
  
      if (response.ok) {
        toast.success('Booking cancelled successfully!');
        const updatedBookings = bookings.filter((booking) => booking.bookingId !== bookingId);
        setBookings(updatedBookings);
      } else {
        throw new Error('Error cancelling booking!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error occurred, please try again!');
    }
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {error && (
        <p className="text-red-500 mb-6 text-center bg-red-100 p-3 rounded-lg">{error}</p>
      )}
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No On-Going bookings found.</p>
      ) : (
        <div>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {currentBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
              >
                <h3 className="text-lg font-bold text-blue-700 mb-3">Booking ID: {booking.bookingId}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
                  <p><span className="font-medium">User:</span> {booking.userName || 'Name not found'}</p>
                  <p><span className="font-medium">Status:</span> {statusMap[booking.status] || "Unknown"}</p>
                  <p><span className="font-medium">Fee:</span> {booking.fee !== null && booking.fee !== undefined ? `${booking.fee.toLocaleString('en-US')} VND` : 'Free'}</p>
                  <p><span className="font-medium">Date:</span> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'No info'}</p>
                  <p><span className="font-medium">Time Slot:</span> {getSlotTime(booking.slot || 0)}</p>
                  {booking.meetUrl && (
                    <p>
                      <span className="font-medium">Link:</span>{' '}
                      <a href={booking.meetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Join meeting
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex mt-4 justify-between">
                  <button
                    onClick={() => handleStartConsultation(booking.bookingId)}
                    className={`text-white px-4 py-2 rounded transition-colors ${
                      booking.isOngoing ? 'bg-blue-500 animate-blink' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {booking.isOngoing ? 'Ongoing Consultation' : 'Start Consultation'}
                  </button>
                  <button
                    onClick={() => handleEndConsultation(booking.bookingId)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    End Consultation
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking.bookingId)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
          <p className="text-center mt-2 text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

export default TherapistBookingList;