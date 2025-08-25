import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axio";
import { useNavigate } from "react-router-dom";

export default function MaterialsPage() {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: "", description: "", fileUrl: "" });
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterials();
    checkUserRole();
  }, [courseId]);

  const checkUserRole = () => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_TEACHER") setIsTeacher(true);
  };

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await API.get(`/materials/course/${courseId}`);
      setMaterials(res.data);
    } catch (error) {
      console.error("Error fetching materials", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/materials/course/${courseId}`, newMaterial);
      setNewMaterial({ title: "", description: "", fileUrl: "" });
      fetchMaterials();
    } catch (error) {
      console.error("Error adding material", error);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await API.delete(`/materials/course/${courseId}/${materialId}`);
      alert("Material deleted successfully.");
      fetchMaterials();
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data); // backend message
      } else {
        alert("Failed to delete material. Please try again.");
      }
      console.error("Error deleting material", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Course Materials</h1>
                <p className="text-blue-100 mt-2">Access learning resources and quizzes</p>
              </div>
              <button
                onClick={() => navigate("/courses")}
                className="bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium backdrop-blur-sm border border-white/30"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Material List */}
            {materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {materials.map((mat) => (
                  <div key={mat.materialId} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="h-full flex flex-col">
                      <div className="flex-grow">
                        {/* Header with icon and delete button */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          {isTeacher && (
                            <button
                              onClick={() => handleDeleteMaterial(mat.materialId)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                              title="Delete material"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        {/* Material Title with clear label */}
                        <div className="mb-4">
                          <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            MATERIAL TITLE
                          </div>
                          <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">{mat.title}</h2>
                        </div>
                        
                        {/* Material Description with clear label */}
                        <div className="mb-4">
                          <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            DESCRIPTION
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-3 bg-gray-50 px-3 py-2 rounded-lg">
                            {mat.description || "No description provided."}
                          </p>
                        </div>
                        
                        {/* File URL with clear label and visual distinction */}
                        {mat.fileUrl && (
                          <div className="mb-4">
                            <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              ATTACHED FILE
                            </div>
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium text-sm bg-blue-50 px-3 py-2 rounded-lg w-full truncate"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="truncate">View Material File</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Take Quiz Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => navigate(`/quizzes/material/${mat.materialId}`, { state: { courseId: courseId } })}
                          className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Take Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
                <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No materials found</h3>
                <p className="text-gray-500">There are no materials available for this course yet.</p>
              </div>
            )}

            {/* Add Material Form (Teacher only) */}
            {isTeacher && (
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Add New Material</h2>
                <form onSubmit={handleAddMaterial} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      placeholder="Enter material title"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Enter material description"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      rows="3"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    ></textarea>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">File URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter file URL"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newMaterial.fileUrl}
                      onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Material
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}