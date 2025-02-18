import React from "react";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
const Header: React.FC = () => {
  const navigate = useNavigate(); 
  return (
    <header className="flex justify-cente bg-white from-blue-500 to-indigo-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <HomeOutlined className="text-3xl hover:text-yellow-300 transition duration-300" />
          <h1 className="r text-blue-600 text-2xl font-bold hover:text-gray-200 transition duration-300">
            WedWise.com
          </h1>
        </div>

      
        {/* <nav className="space-x-4">
          <span
            onClick={() => navigate("/about")}
            className="cursor-pointer hover:text-yellow-300 transition duration-300"
          >
            About
          </span>
          <span
            onClick={() => navigate("/services")}
            className="cursor-pointer hover:text-yellow-300 transition duration-300"
          >
            Services
          </span>
          <span
            onClick={() => navigate("/contact")}
            className="cursor-pointer hover:text-yellow-300 transition duration-300"
          >
            Contact
          </span>
        </nav> */}
      </div>
    </header>
  );
};

export default Header;
  