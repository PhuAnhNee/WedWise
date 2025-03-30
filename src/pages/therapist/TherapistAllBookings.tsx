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
  scheduleDate?: string;
  slot?: number;
  userName?: string;
  therapist?: { consultationFee: number };
  schedule?: { date: string; slot: number };
}

interface User {
  userId: string;
  fullName: string;
  isActive: boolean;
  email: string;
  bookings: any[];
}

const TherapistAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

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

        const bookingsWithDetails = data.map((booking) => ({
          ...booking,
          fee: booking.therapist?.consultationFee || null,
          scheduleDate: booking.schedule?.date || '',
          slot: booking.schedule?.slot || 0,
          userName: users.find((u) => u.userId === booking.memberId)?.fullName || booking.memberId,
        }));

        bookingsWithDetails.sort((a, b) => new Date(b.scheduleDate || '').getTime() - new Date(a.scheduleDate || '').getTime());
        setBookings(bookingsWithDetails);
      } catch (error) {
        toast.error('Error fetching bookings!');
      }
    };

    fetchBookings();
  }, [therapistId, token, users]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {error && (
        <p className="text-red-500 mb-6 text-center bg-red-100 p-3 rounded-lg">{error}</p>
      )}
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No bookings found.</p>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {bookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Booking ID: {booking.bookingId}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><span className="font-medium">User:</span> {booking.userName || 'Name not found'}</p>
                <p><span className="font-medium">Status:</span> {statusMap[booking.status] || 'Unknown'}</p>
                <p><span className="font-medium">Fee:</span> {booking.fee !== null ? `${booking.fee.toLocaleString('en-US')} VND` : 'Free'}</p>
                <p><span className="font-medium">Date:</span> {booking.scheduleDate ? new Date(booking.scheduleDate).toLocaleDateString() : 'No info'}</p>
                <p><span className="font-medium">Time Slot:</span> {getSlotTime(booking.slot || 0)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistAllBookings;