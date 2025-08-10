import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/NavBar";
import UserProfile from "./pages/UserProfile";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

export default function App() {

  //const location = useLocation();
  //const hideNavbarRoutes = ["/login", "/register"];
  const isLoggedIn = !!localStorage.getItem("token");


  /*return (
    <>
      {isLoggedIn && !hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      {/* your routes }
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
      </Routes>
    </>
  );*/

  return(
    <Routes>
      <Route element={<AuthLayout/>}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={
          isLoggedIn ? <MainLayout /> : <Navigate to="/login" replace />
        }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
      </Route>
    </Routes>
  );
}
