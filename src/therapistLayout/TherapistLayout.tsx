import { Outlet, Link, useLocation } from "react-router-dom";

const TherapistLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white p-6">
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
            to="/therapist/appointments"
            className={`block p-2 rounded ${
              location.pathname === "/therapist/appointments" ? "bg-blue-500" : "hover:bg-blue-500"
            }`}
          >
            Appointments
          </Link>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default TherapistLayout;
