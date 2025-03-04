import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../pages/service/AuthService";

const TherapistLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-lg font-bold mb-6">Therapist Dashboard</h1>
          <nav className="space-y-4">
            <Link
              to="/therapist"
              className={`block p-2 rounded ${
                location.pathname === "/therapist" ? "bg-blue-500" : "hover:bg-blue-500"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/therapist/profile"
              className={`block p-2 rounded ${
                location.pathname === "/therapist/profile" ? "bg-blue-500" : "hover:bg-blue-500"
              }`}
            >
              Profile
            </Link>
            <Link
              to="/therapist/calendar"
              className={`block p-2 rounded ${
                location.pathname === "/therapist/calendar" ? "bg-blue-500" : "hover:bg-blue-500"
              }`}
            >
              Calendar
            </Link>
            <Link
              to="/therapist/schedule"
              className={`block p-2 rounded ${
                location.pathname === "/therapist/schedule" ? "bg-blue-500" : "hover:bg-blue-500"
              }`}
            >
              Schedule
            </Link>
            <Link
              to="/therapist/booking-list"
              className={`block p-2 rounded ${
                location.pathname === "/therapist/booking-list" ? "bg-blue-500" : "hover:bg-blue-500"
              }`}
            >
              Booking List
            </Link><Link
              to="/therapist/pending-booking"
              className={`block p-2 rounded ${
                location.pathname === "/therapist/pending-booking" ? "bg-blue-500" : "hover:bg-blue-500"
              }`}
            >
              Pending Booking 
            </Link>
          </nav>
        </div>

        {/* Nút Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all mt-6"
        >
          Logout
        </button>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default TherapistLayout;
