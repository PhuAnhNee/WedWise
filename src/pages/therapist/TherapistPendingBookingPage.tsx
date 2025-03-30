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
  consultationFee: number | null;
  createdAt: string;
  meetUrl?: string;
  hasFeedback?: boolean;
  scheduleId?: string;
  scheduleDate?: string;
  slot?: number;
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [feedbackDescription, setFeedbackDescription] = useState<string>('');

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
        throw new Error('Unable to fetch user list');
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Error fetching user list!');
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
        throw new Error('Unable to fetch booking results');
      }

      const data: BookingResult[] = await response.json();
      const bookingIds = data.map((result) => result.bookingId);
      setExistingBookingIds(bookingIds);
    } catch (error) {
      toast.error('Error fetching booking results!');
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
      setError('You are not logged in or your session has expired!');
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
        const filteredBookings = data.filter((booking) => booking.status === 3);

        const bookingsWithScheduleAndUser = filteredBookings.map((booking) => {
          const user = users.find((u) => u.userId === booking.memberId);
          return {
            ...booking,
            consultationFee: booking.therapist?.consultationFee || null,
            scheduleDate: booking.schedule?.date || '',
            slot: booking.schedule?.slot || 0,
            userName: user ? user.fullName : booking.memberId,
          };
        });

        bookingsWithScheduleAndUser.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());
        setBookings(bookingsWithScheduleAndUser);
      } catch (error) {
        toast.error('Error fetching bookings!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users]);

  const openFeedbackModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setFeedbackDescription('');
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedBookingId(null);
  };

  const handleGiveFeedback = async () => {
    if (!selectedBookingId || !feedbackDescription.trim()) {
      toast.error('Please enter feedback before submitting!');
      return;
    }

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
            bookingId: selectedBookingId,
            description: feedbackDescription,
          }),
        }
      );

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        setExistingBookingIds([...existingBookingIds, selectedBookingId]);
        const updatedBookings = bookings.map((booking) =>
          booking.bookingId === selectedBookingId ? { ...booking, hasFeedback: true } : booking
        );
        setBookings(updatedBookings);
        closeFeedbackModal();
      } else {
        throw new Error('Error submitting feedback!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error occurred, please try again!');
    }
  };

  const getSlotTime = (slot: number) => {
    const slotData = slots.find((s) => s.id === slot.toString());
    return slotData ? slotData.time : 'Unknown';
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
      <Toaster position="top-center" reverseOrder={false} />
      
        {error && (
          <p className="text-red-500 mb-6 text-center bg-red-100 p-3 rounded-lg">{error}</p>
        )}
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No bookings pending feedback found.</p>
        ) : (
          <div>
          {bookings.map((booking) => (
            <div
              key={booking.bookingId}
              className={`border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
                existingBookingIds.includes(booking.bookingId) ? 'border-blue-300 bg-blue-50' : ''
              }`}
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Booking ID: {booking.bookingId}
              </h3>
              <div className="text-gray-700">
                <p><span className="font-medium">User:</span> {booking.userName || 'Name not found'}</p>
                <p><span className="font-medium">Status:</span> {statusMap[booking.status] || 'Unknown'}</p>
                <p><span className="font-medium">Fee:</span> {booking.consultationFee?.toLocaleString('en-US') || 'Free'} VND</p>
                <p><span className="font-medium">Date:</span> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium">Time Slot:</span> {getSlotTime(booking.slot || 0)}</p>
              </div>
              <div className="flex space-x-4 mt-4 justify-end">
                {existingBookingIds.includes(booking.bookingId) ? (
                  <button className="bg-gray-500 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
                    Feedback Completed
                  </button>
                ) : (
                  <button
                    onClick={() => openFeedbackModal(booking.bookingId)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Provide Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-blue-200 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Provide Feedback</h3>
            <textarea
              value={feedbackDescription}
              onChange={(e) => setFeedbackDescription(e.target.value)}
              placeholder="Enter your feedback here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={closeFeedbackModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGiveFeedback}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistPendingBooking;