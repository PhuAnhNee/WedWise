import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Dữ liệu doanh thu theo ngày
const revenueByDay = [
  { day: "Mon", revenue: 200 },
  { day: "Tue", revenue: 350 },
  { day: "Wed", revenue: 280 },
  { day: "Thu", revenue: 500 },
  { day: "Fri", revenue: 400 },
  { day: "Sat", revenue: 600 },
  { day: "Sun", revenue: 450 },
];

// Dữ liệu doanh thu theo tháng (12 tháng)
const revenueByMonth = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 4500 },
  { month: "Mar", revenue: 5200 },
  { month: "Apr", revenue: 4800 },
  { month: "May", revenue: 5500 },
  { month: "Jun", revenue: 6000 },
  { month: "Jul", revenue: 5800 },
  { month: "Aug", revenue: 6100 },
  { month: "Sep", revenue: 6300 },
  { month: "Oct", revenue: 7000 },
  { month: "Nov", revenue: 7200 },
  { month: "Dec", revenue: 7500 },
];

// Dữ liệu doanh thu theo quý
const revenueByQuarter = [
  { quarter: "Q1", revenue: 14000 },
  { quarter: "Q2", revenue: 16000 },
  { quarter: "Q3", revenue: 18000 },
  { quarter: "Q4", revenue: 20000 },
];

// Dữ liệu số lượt review
const reviewData = [
  { name: "5 Stars", value: 60 },
  { name: "4 Stars", value: 25 },
  { name: "3 Stars", value: 10 },
  { name: "2 Stars", value: 3 },
  { name: "1 Star", value: 2 },
];

const COLORS = ["#4CAF50", "#8BC34A", "#FFC107", "#FF5722", "#F44336"];

// Dữ liệu số lượt booking
const bookingData = [
  { day: "Mon", bookings: 5 },
  { day: "Tue", bookings: 8 },
  { day: "Wed", bookings: 6 },
  { day: "Thu", bookings: 10 },
  { day: "Fri", bookings: 7 },
  { day: "Sat", bookings: 12 },
  { day: "Sun", bookings: 9 },
];

const TherapistDashboard = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Welcome, Therapist!</h2>
      <p className="mb-6">This is your dashboard where you can track revenue, reviews, and bookings.</p>

      {/* Biểu đồ doanh thu theo tháng (chiếm toàn bộ 1 hàng) */}
      <div className="p-4 bg-gray-50 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Revenue by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#E91E63" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hai biểu đồ trên cùng một hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doanh thu theo ngày */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Revenue by Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doanh thu theo quý */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Revenue by Quarter</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByQuarter}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hai biểu đồ tiếp theo trên cùng một hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Số lượt review */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Review Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={reviewData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {reviewData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Số lượt booking */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Bookings per Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingData}>
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
};

export default TherapistDashboard;
