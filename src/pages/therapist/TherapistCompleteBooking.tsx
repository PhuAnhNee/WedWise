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
  feedback?: Feedback;
}

interface Feedback {
  userName: string;
  avatarUrl: string;
  feedbackId: string;
  bookingId: string;
  rating: number;
  feedbackTitle: string;
  feedbackContent: string;
  isSatisfied: boolean;
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
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
    4: "Approved by Admin",
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

  const fetchFeedbacks = async () => {
    if (!therapistId || !token) return;
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Feedback/Get_Feedback_By_TherapistId?id=${therapistId}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Unable to fetch feedback list');
      const data: Feedback[] = await response.json();
      setFeedbacks(data);
    } catch (error) {
      toast.error('Error fetching feedback list!');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFeedbacks();
  }, [token, therapistId]);

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
        data = data.filter((booking) => booking.status === 4);

        const bookingsWithSchedule = data.map((booking) => {
          const bookingFeedback = feedbacks.find((feedback) => feedback.bookingId === booking.bookingId);
          return {
            ...booking,
            fee: booking.therapist?.consultationFee || null,
            scheduleDate: booking.schedule?.date || '',
            slot: booking.schedule?.slot || 0,
            userName: users.find((u) => u.userId === booking.memberId)?.fullName || booking.memberId,
            feedback: bookingFeedback,
          };
        });

        bookingsWithSchedule.sort((a, b) => new Date(b.scheduleDate || '').getTime() - new Date(a.scheduleDate || '').getTime());
        setBookings(bookingsWithSchedule);
      } catch (error) {
        toast.error('Error fetching bookings!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users, feedbacks]);

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
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
        <p className="text-gray-500 text-center py-6">No Completed bookings found.</p>
      ) : (
        <div>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {currentBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
              >
                <h3 className="text-xl font-bold text-blue-700 mb-3">Booking ID: {booking.bookingId}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <p className="text-base"><span className="font-semibold">User:</span> {booking.userName || 'Name not found'}</p>
                  <p className="text-base"><span className="font-semibold">Status:</span> {statusMap[booking.status] || "Unknown"}</p>
                  <p className="text-base"><span className="font-semibold">Fee:</span> {booking.fee !== null && booking.fee !== undefined ? `${booking.fee.toLocaleString('en-US')} VND` : 'Free'}</p>
                  <p className="text-base"><span className="font-semibold">Date:</span> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'No info'}</p>
                  <p className="text-base"><span className="font-semibold">Time Slot:</span> {getSlotTime(booking.slot || 0)}</p>
                </div>
                {booking.feedback ? (
                  <div className="mt-5 pt-5 border-t-2 border-blue-100">
                    <h4 className="font-bold text-lg text-indigo-700 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"></path>
                      </svg>
                      Client Feedback
                    </h4>
                    <div className="bg-indigo-50 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start">
                        <div className="mr-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm">
                            <img
                              src={booking.feedback.avatarUrl || '/default-avatar.png'}
                              alt={booking.feedback.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/64';
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center mb-2">
                            <h5 className="text-lg font-bold text-gray-800 mr-3">{booking.feedback.userName}</h5>
                            <div className="flex items-center">
                              <StarRating rating={booking.feedback.rating} />
                              <span className="ml-2 font-bold text-yellow-600">{booking.feedback.rating}/5</span>
                            </div>
                          </div>
                          {booking.feedback.feedbackTitle && (
                            <h6 className="font-bold text-gray-800 mb-1 text-base">{booking.feedback.feedbackTitle}</h6>
                          )}
                          <p className="text-gray-700 mb-2 text-base">{booking.feedback.feedbackContent}</p>
                          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.feedback.isSatisfied ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <svg
                              className={`w-4 h-4 mr-1 ${booking.feedback.isSatisfied ? 'text-green-600' : 'text-red-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              {booking.feedback.isSatisfied ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                              )}
                            </svg>
                            {booking.feedback.isSatisfied ? 'Satisfied' : 'Not Satisfied'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 pt-5 border-t-2 border-gray-100 text-gray-500 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span className="font-medium text-base">No feedback provided for this booking</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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

export default TherapistCompleteBooking;