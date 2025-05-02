import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import { useLocation } from "react-router-dom";
import CommunityPage from "./pages/community/CommunityPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  return (
    <div className="flex max-w-6xl mx-auto">
      {!isAuthPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/community/:communityName" element={<CommunityPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:handle" element={<ProfilePage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
