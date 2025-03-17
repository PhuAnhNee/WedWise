import React from "react";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-150"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-300"></div>
          <span className="ml-2">Đang tải...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;