// src/components/CourseForm.jsx
import { useState } from "react";
import API from "../api/axio";

const CourseForm = ({ onCourseAdded }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("courses", formData);
      setFormData({ name: "", description: "" });
      onCourseAdded();
    } catch (err) {
      alert("Error adding course. Check console.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 w-full lg:w-1/2">
      <h2 className="text-2xl font-bold mb-4">Add New Course</h2>
      <input
        type="text"
        placeholder="Course Name"
        className="border p-2 w-full mb-4 rounded"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Course Description"
        className="border p-2 w-full mb-4 rounded"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Course
      </button>
    </form>
  );
};

export default CourseForm;
