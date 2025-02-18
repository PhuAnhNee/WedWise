import React from "react";

const Settings: React.FC = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    <span role="img" aria-label="settings">📋</span> Settings
                </h1>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-lg font-semibold text-gray-700">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="border border-gray-300 rounded-lg p-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="text-lg font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="border border-gray-300 rounded-lg p-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="text-lg font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="border border-gray-300 rounded-lg p-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="text-center mt-6">
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
