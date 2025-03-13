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
import QuestionManage from "./pages/admin/question-manage/index";
import BookingManage from "./pages/admin/booking-manage/index";
import Feedback from "./pages/admin/feedback/index";
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
import QuizPage from "./pages/member/QuizPage";
import QuizDetail from "./pages/member/QuizDetail";
import TherapistDashboard from "./pages/therapist/TherapistDashboard";
import TherapistProfile from "./pages/therapist/TherapistProfile";
import TherapistCalendar from "./pages/therapist/TherapistCalendar";
import TherapistLayout from "./therapistLayout/TherapistLayout";
import Wallet from "./pages/member/Wallet";
import TherapistSchedule from "./pages/therapist/TherapistSchedule";
import TherapistBookingList from "./pages/therapist/TherapistBookingList";
import TherapistPendingBooking from "./pages/therapist/TherapistPendingBookingPage";
import TherapistCompleteBooking from "./pages/therapist/TherapistCompleteBooking";
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
        <Route path="question-manage" element={<QuestionManage />} />
        <Route path="answer-manage" element={<AnswerManage />} />
        <Route path="booking-manage" element={<BookingManage />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="therapist" element={<TherapistPage />} />
          <Route path="therapist/:id" element={<TherapistDetail />} /> {/* Sửa lỗi nested route */}
          <Route path="my-booking" element={<MyBooking />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="quiz/:quizId" element={<QuizDetail />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/therapist" element={<TherapistLayout />}>
          <Route index element={<TherapistDashboard />} />
          <Route path="profile" element={<TherapistProfile />} />
          <Route path="booking-list" element={<TherapistBookingList />} />
          <Route path="calendar" element={<TherapistCalendar />} />
          <Route path="schedule" element={<TherapistSchedule />} />
          <Route path="pending-booking" element={<TherapistPendingBooking />} />
          <Route path="wallets" element={<Wallet />} />
          <Route path="complete-booking" element={<TherapistCompleteBooking />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
