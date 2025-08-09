import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="text-2xl font-bold text-black-700">
        <Link to="/">Second Year LMS</Link>
      </div>
      <div className="space-x-6 text-gray-700 text-sm font-medium hidden md:flex">
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/courses" className="hover:text-blue-600">Courses</Link>
        <Link to="/materials" className="hover:text-blue-600">Materials</Link>
        <Link to="/quizzes" className="hover:text-blue-600">Quizzes</Link>
        <Link to="/profile" className="hover:text-blue-600">Profile</Link>
      </div>

      {/* Mobile Menu Button (optional, implement dropdown if needed) */}
      <div className="md:hidden">
        {/* Add mobile menu toggle if you want later */}
      </div>
    </nav>
  );
}
