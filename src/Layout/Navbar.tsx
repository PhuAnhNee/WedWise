import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaWallet } from "react-icons/fa";
import { Dropdown, Menu } from "antd";
import AuthService from "../pages/service/AuthService";
import axios from "axios";



const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    // Get user data when component mounts
    const userData = AuthService.getCurrentUser();
    if (userData) {
      setUserName(userData.Name || "User");
      setUserAvatar(userData.Avatar || "");
      
      // Fetch wallet balance
      fetchWalletBalance();
    }
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const API_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Auth/GetWallet";
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
  
      // Kiểm tra nếu response trả về dữ liệu hợp lệ
      if (response.data && response.data.wallet) {
        setWalletBalance(response.data.wallet.balance);
      } else {
        console.error("Invalid wallet data format", response.data);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };
  

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/home/profile">Profile</Link>
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
        <div className="flex items-center gap-5">
          <div className="pt-3">
        <h1 className="text-2xl font-bold text-blue-600">
          <Link to="/home">WedWise</Link>
        </h1>
        </div>
        {/* Navbar */}
        <nav className="hidden md:flex gap-6">
          <Link to="/home" className="hover:text-blue-500 transition">
            Home
          </Link>
          
          <Link to="/home/quizzes" className="hover:text-blue-500 transition">
            Quizzes
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
        </div>
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

          {/* Wallet Icon with Balance */}
          <div 
            onClick={() => navigate("/home/wallet")}
            className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-blue-600 transition"
          >
            <FaWallet className="text-2xl" />
            <span className="font-medium">${walletBalance}</span>
          </div>

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