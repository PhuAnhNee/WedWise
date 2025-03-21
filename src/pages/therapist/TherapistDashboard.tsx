import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import AuthService from "../service/AuthService";

interface Transaction {
  transactionId: string;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  createdUser: null;
  updatedUser: null;
}

interface WalletData {
  wallet: {
    walletId: string;
    userId: string;
    balance: number;
    user: null;
  };
  transactions: Transaction[];
}

interface Schedule {
  scheduleId: string;
  therapistId: string;
  date: string;
  slot: number;
  status: number;
  therapist: any;
  bookings: any;
}

interface Booking {
  bookingId: string;
  memberId: string;
  therapistId: string;
  scheduleId: string;
  feedback: any;
  schedule: Schedule;
  therapist: any;
  status: number;
  meetUrl: string;
}

interface Feedback {
  feedbackId: string;
  bookingId: string;
  rating: number;
  feedbackTitle: string;
  feedbackContent: string;
  isSatisfied: boolean;
}

const COLORS = ["#4CAF50", "#8BC34A", "#FFC107", "#FF5722", "#F44336"];

const TherapistDashboard = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [bookingDataApi, setBookingDataApi] = useState<Booking[]>([]);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = AuthService.getCurrentUser();
  const therapistId: string | undefined = currentUser?.UserId;

  const walletApi = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Auth/GetWallet";
  const bookingApi = `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Booking/Get_Booking_By_Therapist_Id?id=${therapistId}`;
  const feedbackApi = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Feedback/Get_All_Feedbacks";

  const authService = AuthService;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authService.getToken();
        if (!token || authService.isTokenExpired() || !therapistId) {
          setError("Please log in to access the dashboard.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [walletRes, bookingRes, feedbackRes] = await Promise.all([
          fetch(walletApi, { headers }),
          fetch(bookingApi, { headers }),
          fetch(feedbackApi, { headers }),
        ]);

        if (!walletRes.ok) {
          throw new Error(`Wallet API failed with status: ${walletRes.status}`);
        }
        if (!bookingRes.ok) {
          throw new Error(`Booking API failed with status: ${bookingRes.status}`);
        }
        if (!feedbackRes.ok) {
          throw new Error(`Feedback API failed with status: ${feedbackRes.status}`);
        }

        const walletJson: WalletData = await walletRes.json();
        const bookingJson: Booking[] = await bookingRes.json();
        const feedbackJson: Feedback[] = await feedbackRes.json();

        setWalletData(walletJson);
        setBookingDataApi(bookingJson);
        setFeedbackData(feedbackJson);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId]);

  const totalRevenue = walletData?.transactions
    ? walletData.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    : 0;

  const totalBookings = bookingDataApi.length;
  const averageRating =
    feedbackData.length > 0
      ? feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbackData.length
      : 0;
  const pendingBookings = bookingDataApi.filter((booking) => booking.status !== 4).length;

  const revenueChange = "+5%";
  const bookingsChange = "+3%";
  const ratingChange = "+1%";
  const pendingChange = "+0%";

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <span className="text-sm text-gray-500">
          Last Updated: {new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour12: true, hour: "2-digit", minute: "2-digit" })} PDT
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-xl font-semibold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-sm mt-2">{revenueChange} from last month</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-xl font-semibold">{totalBookings}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-sm mt-2">{bookingsChange} from last month</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <p className="text-xl font-semibold">{averageRating.toFixed(1)}/5</p>
            </div>
            <div className="bg-teal-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.976-2.888c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-sm mt-2">{ratingChange} from last month</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Complete Bookings</p>
              <p className="text-xl font-semibold">{pendingBookings}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-sm mt-2">{pendingChange} from last month</p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Revenue by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={calculateRevenueByMonth()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#E91E63" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Revenue by Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={calculateRevenueByDay()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Revenue by Quarter</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={calculateRevenueByQuarter()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Review Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={calculateReviewData()} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {calculateReviewData().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Bookings per Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={calculateBookingsByDay()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3F51B5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  function calculateRevenueByDay() {
    return walletData?.transactions
      ?.reduce((acc: { day: string; revenue: number }[], transaction: Transaction) => {
        const date = new Date(transaction.createdAt);
        const day = date.toLocaleString("en-US", { weekday: "short" });
        const existing = acc.find((item) => item.day === day);
        if (existing) {
          existing.revenue += transaction.amount;
        } else {
          acc.push({ day, revenue: transaction.amount });
        }
        return acc;
      }, [])
      .sort((a: { day: string }, b: { day: string }) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days.indexOf(a.day) - days.indexOf(b.day);
      }) || [];
  }

  function calculateRevenueByMonth() {
    return walletData?.transactions
      ?.reduce((acc: { month: string; revenue: number }[], transaction: Transaction) => {
        const date = new Date(transaction.createdAt);
        const month = date.toLocaleString("en-US", { month: "short" });
        const existing = acc.find((item) => item.month === month);
        if (existing) {
          existing.revenue += transaction.amount;
        } else {
          acc.push({ month, revenue: transaction.amount });
        }
        return acc;
      }, []) || [];
  }

  function calculateRevenueByQuarter() {
    return walletData?.transactions
      ?.reduce((acc: { quarter: string; revenue: number }[], transaction: Transaction) => {
        const date = new Date(transaction.createdAt);
        const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
        const existing = acc.find((item) => item.quarter === quarter);
        if (existing) {
          existing.revenue += transaction.amount;
        } else {
          acc.push({ quarter, revenue: transaction.amount });
        }
        return acc;
      }, []) || [];
  }

  function calculateReviewData() {
    return feedbackData
      ?.filter((feedback) =>
        bookingDataApi.some((booking) => booking.bookingId === feedback.bookingId)
      )
      ?.reduce((acc: { name: string; value: number }[], feedback: Feedback) => {
        const rating = `${feedback.rating} Star${feedback.rating > 1 ? "s" : ""}`;
        const existing = acc.find((item) => item.name === rating);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: rating, value: 1 });
        }
        return acc;
      }, [])
      ?.sort((a: { name: string }, b: { name: string }) => b.name.localeCompare(a.name)) || [];
  }

  function calculateBookingsByDay() {
    return bookingDataApi
      ?.reduce((acc: { day: string; bookings: number }[], booking: Booking) => {
        const date = new Date(booking.schedule.date);
        const day = date.toLocaleString("en-US", { weekday: "short" });
        const existing = acc.find((item) => item.day === day);
        if (existing) {
          existing.bookings += 1;
        } else {
          acc.push({ day, bookings: 1 });
        }
        return acc;
      }, [])
      ?.sort((a: { day: string }, b: { day: string }) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days.indexOf(a.day) - days.indexOf(b.day);
      }) || [];
  }
};

export default TherapistDashboard;