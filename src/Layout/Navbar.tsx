import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaWallet } from "react-icons/fa";
import { Dropdown, Menu } from "antd";
import AuthService from "../pages/service/AuthService";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [userAvatar, setUserAvatar] = useState<string>("");

  useEffect(() => {
    // Get user data when component mounts
    const userData = AuthService.getCurrentUser();
    if (userData) {
      setUserName(userData.Name || "User");
      setUserAvatar(userData.Avatar || "");
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="settings">
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-blue-600">
          <Link to="/">WedWise</Link>
        </h1>

        {/* Navbar */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/home" className="hover:text-blue-500 transition">
            Home
          </Link>
          <Link to="/getting-married" className="hover:text-blue-500 transition">
            Getting Married
          </Link>
          <Link to="/home/quizzes" className="hover:text-blue-500 transition">
            Quizzes
          </Link>
          <Link to="/counseling" className="hover:text-blue-500 transition">
            Counseling
          </Link>
          <Link to="/help" className="hover:text-blue-500 transition">
            Help
          </Link>
          <Link to="/home/therapist" className="hover:text-blue-500 transition">
            Find a Therapist
          </Link>
          <Link to="/home/my-booking" className="hover:text-blue-500 transition">
            My Booking
          </Link>
        </nav>

        {/* Search & User Info */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>

          {/* Wallet Icon */}
          <button
            onClick={() => navigate("/home/wallet")}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            <FaWallet className="text-2xl" />
          </button>

          {/* User Info with Dropdown */}
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div className="flex items-center space-x-2 cursor-pointer">
              <span className="text-gray-700 font-medium">{userName}</span>
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-3xl text-gray-600" />
              )}
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Navbar;