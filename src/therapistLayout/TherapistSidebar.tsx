import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../pages/service/AuthService";
import { useState, useEffect } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WalletOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button } from "antd";
import axios from "axios";

interface TherapistProfile {
  therapistName: string;
  avatar: string;
  status: boolean;
}

interface TherapistSidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (isExpanded: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
}

const TherapistSidebar = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: TherapistSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  const currentUser = AuthService.getCurrentUser();
  const therapistId = currentUser?.UserId;

  useEffect(() => {
    const fetchTherapistProfile = async () => {
      if (!therapistId) {
        console.warn("No therapistId found");
        return;
      }
      try {
        const { data } = await axios.get<TherapistProfile>(
          "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Therapist/Get_Therapist_By_Id",
          { params: { id: therapistId } }
        );
        setTherapistProfile(data);
      } catch (error) {
        console.error("Failed to fetch therapist profile:", error);
      }
    };
    fetchTherapistProfile();
  }, [therapistId]);

  const navItems = [
    { path: "/therapist", label: "DashBoard", icon: <DashboardOutlined /> },
    { path: "/therapist/profile", label: "Profile", icon: <UserOutlined /> },
    { path: "/therapist/calendar", label: "Schedule", icon: <CalendarOutlined /> },
    { path: "/therapist/booking-list", label: "Booking List", icon: <FileTextOutlined /> },
    { path: "/therapist/therapist-wallets", label: "Wallet", icon: <WalletOutlined /> },
    
  ];

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full z-10 bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 text-white shadow-xl transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "w-64" : "w-16"
        } hidden lg:block`}
      >
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-16 bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-blue-100 hover:shadow-lg transition-all duration-200"
        >
          {isSidebarExpanded ? "◀" : "▶"}
        </button>
        <div className="flex flex-col h-full justify-between">

          <div
            className={`p-5 border-b border-blue-300/50 flex items-center ${
              isSidebarExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <SettingOutlined className="text-2xl text-white" />
            {isSidebarExpanded && (
              <span className="text-xl font-semibold ml-3 tracking-wide text-white">Therapist</span>
            )}
          </div>
          
          <nav className="px-3 py-6 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-lg p-3 transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-white shadow-inner"
                    : "text-white hover:bg-blue-600/50 hover:shadow-md"
                } ${isSidebarExpanded ? "justify-start" : "justify-center"}`}
              >
                <span
                  className={`text-xl ${
                    !isSidebarExpanded && "mx-auto"
                  } ${location.pathname === item.path ? "text-black" : "text-white"}`}
                >
                  {item.icon}
                </span>
                {isSidebarExpanded && (
                  <span
                    className={`ml-3 text-base font-semibold ${
                      location.pathname === item.path ? "text-black" : "text-gray-100 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-blue-300/50">
            {isSidebarExpanded ? (
              <>
                <div className="mb-4 p-3 bg-blue-600/30 rounded-lg shadow-inner flex items-center">
                  <Avatar
                    size={40}
                    src={therapistProfile?.avatar || undefined}
                    icon={!therapistProfile?.avatar ? <UserOutlined /> : undefined}
                    style={{
                      background: therapistProfile?.avatar ? "transparent" : "linear-gradient(to right, #22d3ee, #3b82f6)",
                    }}
                    className="flex items-center justify-center text-white font-bold"
                  >
                    {therapistProfile?.therapistName ? therapistProfile.therapistName[0] : "T"}
                  </Avatar>
                  <div className="ml-3">
                    <div className="font-semibold text-sm text-white">
                      {therapistProfile?.therapistName || "Nhà Tư Vấn"}
                    </div>
                    <div className="text-xs text-blue-100 flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ background: therapistProfile?.status ? "#52c41a" : "#ff4d4f" }}
                      />
                      {therapistProfile?.status ? "Trực tuyến" : "Không hoạt động"}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  icon={<LogoutOutlined />}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Avatar
                  size={32}
                  src={therapistProfile?.avatar || undefined}
                  icon={!therapistProfile?.avatar ? <UserOutlined /> : undefined}
                  style={{
                    background: therapistProfile?.avatar ? "transparent" : "linear-gradient(to right, #22d3ee, #3b82f6)",
                  }}
                  className="flex items-center justify-center text-white font-bold"
                >
                  {therapistProfile?.therapistName ? therapistProfile.therapistName[0] : "T"}
                </Avatar>
                <Button
                  onClick={handleLogout}
                  icon={<LogoutOutlined />}
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  title="Log out"
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      
      <aside
        className={`fixed top-0 left-0 w-64 h-full z-20 bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 text-white shadow-xl transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        <div className="flex flex-col h-full justify-between">
          
          <div className="p-5 border-b border-blue-300/50 flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center tracking-wide text-white">
              <SettingOutlined className="mr-2 text-2xl" />
              Therapist
            </h1>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-white text-2xl hover:text-blue-100 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          
          <nav className="p-4 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-white shadow-md"
                    : "text-white hover:bg-blue-600/50 hover:shadow-md"
                }`}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <span
                  className={`mr-3 text-xl ${location.pathname === item.path ? "text-black" : "text-white"}`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-base font-semibold ${
                    location.pathname === item.path ? "text-black" : "text-gray-100 hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-blue-300/50">
            <div className="mb-4 p-3 bg-blue-600/30 rounded-lg shadow-inner flex items-center">
              <Avatar
                size={40}
                src={therapistProfile?.avatar || undefined}
                icon={!therapistProfile?.avatar ? <UserOutlined /> : undefined}
                style={{
                  background: therapistProfile?.avatar ? "transparent" : "linear-gradient(to right, #22d3ee, #3b82f6)",
                }}
                className="flex items-center justify-center text-white font-bold"
              >
                {therapistProfile?.therapistName ? therapistProfile.therapistName[0] : "T"}
              </Avatar>
              <div className="ml-3">
                <div className="font-semibold text-sm text-white">
                  {therapistProfile?.therapistName || "Nhà Tư Vấn"}
                </div>
                <div className="text-xs text-blue-100 flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ background: therapistProfile?.status ? "#52c41a" : "#ff4d4f" }}
                  />
                  {therapistProfile?.status ? "Trực tuyến" : "Không hoạt động"}
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              icon={<LogoutOutlined />}
              className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TherapistSidebar;