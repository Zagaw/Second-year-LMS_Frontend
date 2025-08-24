import { useState } from "react";
import API from "../api/axio";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/users/login", credentials);
      const token = res.data.replace("JWT Token: ", "").trim();

      // Decode JWT to get role
      const decoded = jwtDecode(token);
      const role = decoded.role || "";
      
      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Fetch user details from backend
      const meRes = await API.get("/users/me");
      localStorage.setItem("userId", meRes.data.id);
      localStorage.setItem("username", meRes.data.username);

      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 p-12 flex-col justify-between text-white">
        <div className="flex items-center">
          <div className="bg-white text-blue-800 font-bold text-xl p-2 rounded-md">LMS</div>
          <span className="ml-3 font-semibold text-xl">Learning System</span>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome to Our Learning Platform</h1>
          <p className="text-blue-100 text-lg">
            Access courses, track your progress, and connect with instructors all in one place.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <div className="h-1 w-12 bg-blue-400 rounded-full"></div>
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <div className="h-1 w-12 bg-blue-700 rounded-full"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Account Login</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 font-semibold">
            Log In
          </button>
          
          <div className="text-center text-sm text-gray-500 pt-4">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register now
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}