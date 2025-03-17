import { Outlet } from "react-router-dom";
import { useState } from "react";
import TherapistSidebar from "./TherapistSidebar.tsx";

const TherapistLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen bg-sky-50">
      {/* Mobile toggle button - only visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-full bg-sky-600 text-white shadow-lg"
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

      {/* Sidebar component */}
      <TherapistSidebar 
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileSidebarOpen={isMobileSidebarOpen} 
        setIsMobileSidebarOpen={setIsMobileSidebarOpen} 
      />

      {/* Main content - adjusts based on sidebar width */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'} p-6`}>
        
          <Outlet />
       
      </main>
    </div>
  );
};

export default TherapistLayout;