import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'antd/dist/reset.css';
import Layout from "./Layout/Layout";
import Login from "./pages/login";
import LoginAdmin from "./pages/admin/login/index";
import Dashboard from "./pages/admin/dashboard/index";
import WithDraw from "./pages/admin/withdraw/index";
import Manage from "./pages/admin/manage/index";
import QuizManage from "./pages/admin/quiz-manage/index";
import AnswerManage from "./pages/admin/answer-manage/index";
import ProfileAdmin from "./pages/admin/profile";
// import DashboardLayout from "./component/dashboard";
import DashboardAdmin from "./pages/admin/dashboard/maindb";
import TherapistPage from "./pages/member/TherapistPage";
import TherapistDetail from "./pages/member/TherrapistDetail";
import MyBooking from "./pages/member/MyBooking";
import HomePage from "./pages/member/Home";
import Profile from "./pages/member/Profile";
import Settings from "./pages/member/Setting";
import Register from "./pages/register/Register";
import TherapistDashboard from "./pages/therapist/TherapistDashboard";
import TherapistProfile from "./pages/therapist/TherapistProfile";
import TherapistAppointments from "./pages/therapist/TherapistAppointment";
import TherapistCalendar from "./pages/therapist/TherapistCalendar";
import TherapistLayout from "./therapistLayout/TherapistLayout";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="dbhome" element={<Dashboard />} />
        <Route path="users" element={<WithDraw />} />
        <Route path="manage" element={<Manage />} />
        <Route path="quiz-manage" element={<QuizManage />} />
        <Route path="answer-manage" element={<AnswerManage />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="therapist" element={<TherapistPage/>} />
          <Route path="therapist/:id" element={<TherapistDetail />} /> {/* Sửa lỗi nested route */}
          <Route path="my-booking" element={<MyBooking />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/therapist" element={<TherapistLayout />}>
          <Route index element={<TherapistDashboard />} />
          <Route path="profile" element={<TherapistProfile />} />
          <Route path="appointments" element={<TherapistAppointments />} />
          <Route path="calendar" element={<TherapistCalendar />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
