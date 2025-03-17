import React from "react";
import { Outlet } from "react-router-dom";
// import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
