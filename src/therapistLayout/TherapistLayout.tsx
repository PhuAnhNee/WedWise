import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../pages/service/AuthService";
import { useState } from "react";

const TherapistLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  const navItems = [
    { path: "/therapist", label: "Dashboard", icon: "📊" },
    { path: "/therapist/profile", label: "Profile", icon: "👤" },
    { path: "/therapist/calendar", label: "Calendar", icon: "📅" },
    { path: "/therapist/booking-list", label: "Booking List", icon: "📋" },
    { path: "/therapist/pending-booking", label: "Pending Booking", icon: "⏳" },
    { path: "/therapist/therapist-wallets", label: "Wallets", icon: "💰" },
    { path: "/therapist/complete-booking", label: "Complete Booking", icon: "✅" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-full bg-blue-600 text-white shadow-lg"
        >
          {isMobileSidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static w-64 bg-gradient-to-b from-blue-700 to-blue-600 text-white shadow-xl z-10 h-full transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-blue-500">
            <h1 className="text-xl font-bold flex items-center">
              <span className="mr-2">🧠</span> 
              Therapist Portal
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    location.pathname === item.path 
                      ? "bg-white text-blue-700 font-medium shadow-md" 
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User section & Logout */}
          <div className="p-4 border-t border-blue-500">
            <div className="mb-4 p-3 bg-blue-800 bg-opacity-30 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg">
                  T
                </div>
                <div className="ml-3">
                  <div className="font-medium">Therapist</div>
                  <div className="text-xs text-blue-200">Online</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              <span className="mr-2">🚪</span> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TherapistLayout;