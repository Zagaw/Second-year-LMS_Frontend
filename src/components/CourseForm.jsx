// src/components/CourseForm.jsx
/*import { useState } from "react";
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

export default CourseForm;*/

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
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Create New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Course Name</label>
          <input
            type="text"
            placeholder="Enter course name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Description</label>
          <textarea
            placeholder="Enter course description"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CourseForm;
