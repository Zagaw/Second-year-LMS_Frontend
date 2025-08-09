import { useEffect, useState } from "react";
import API from "../api/axio";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState({ id: "", username: "", email: "" });
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/users/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        alert("Failed to load profile");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      password: newPassword || undefined, // only include if changed
    };
    try {
      await API.put(`/users/${user.id}`, updated);
      alert("Profile updated!");
    } catch {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-black-700">User Profile</h2>

        <input
          type="text"
          name="username"
          value={user.username}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-lg"
          placeholder="Username"
        />

        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-lg"
          placeholder="Email"
        />

        <input
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
          placeholder="New Password (optional)"
        />

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}
