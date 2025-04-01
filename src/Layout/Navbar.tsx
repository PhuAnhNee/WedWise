import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaWallet } from "react-icons/fa";
import { Dropdown, Menu } from "antd";
import AuthService from "../pages/service/AuthService";
import axios from "axios";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = AuthService.getCurrentUser();
    if (userData) {
      setUserName(userData.Name || "User");
      setUserAvatar(userData.Avatar || "");
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
      if (response.data && response.data.wallet) {
        setWalletBalance(response.data.wallet.balance);
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
    <Menu className="rounded-lg shadow-lg border border-gray-100">
      <Menu.Item key="profile" className="hover:bg-indigo-50 text-gray-900">
        <Link to="/home/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="profile" className="hover:bg-indigo-50 text-gray-900">
        <Link to="/home/quizresult">Quiz results</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout} className="hover:bg-red-50 text-red-600">
        Logout
      </Menu.Item>
    </Menu>
  );

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/home/quizzes", label: "Quizzes" },
    { to: "/help", label: "Help" },
    { to: "/home/therapist", label: "Find a Therapist" },
    { to: "/home/my-booking", label: "My Booking" },
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-white-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            <Link to="/home">WedWise</Link>
          </motion.h1>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-900 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={link.to}
                  className="text-white hover:text-indigo-900 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <input
                type="text"
                placeholder="Search..."
                className="rounded-full px-4 py-2 pl-10 bg-white/90 backdrop-blur-sm border-none focus:ring-2 focus:ring-indigo-300 focus:outline-none text-gray-900 placeholder-gray-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
            </motion.div>

            {/* Wallet */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/home/wallet")}
              className="flex items-center space-x-2 cursor-pointer bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-gray-900 hover:bg-white/30 transition-all duration-200"
            >
              <FaWallet className="text-xl text-gray-900" />
              <span className="font-medium">{walletBalance.toLocaleString()} VND</span>
            </motion.div>

            {/* User Dropdown */}
            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 cursor-pointer text-gray-900 hover:text-indigo-900 transition-colors duration-200"
              >
                <span className="font-medium hidden lg:inline">{userName}</span>
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User avatar"
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-900"
                  />
                ) : (
                  <FaUserCircle className="text-3xl text-gray-900" />
                )}
              </motion.div>
            </Dropdown>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-900 hover:text-indigo-900 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-full px-4 py-2 pl-10 bg-white/90 border-none focus:ring-2 focus:ring-indigo-300 focus:outline-none text-gray-900 placeholder-gray-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
              </div>
              <div
                onClick={() => {
                  navigate("/home/wallet");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer bg-white/20 rounded-full px-4 py-2 text-gray-900 hover:bg-white/30"
              >
                <FaWallet className="text-xl text-gray-900" />
                <span className="font-medium">${walletBalance.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Navbar;