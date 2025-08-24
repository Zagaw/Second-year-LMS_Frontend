/*import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT
      setUsername(payload.sub);
    } catch (e) {
      console.error("Invalid token");
      navigate("/login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>
      </div>
    </div>
  );
}*/

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axio";

export default function QuizSubmissionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId");
  const [submissions, setSubmissions] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);

  const checkUserRole = () => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_TEACHER") setIsTeacher(true);
  };

  useEffect(() => {
    checkUserRole();

    if (isTeacher) {
      // Teacher → get all submissions
      API.get(`/teacher/submissions`)
        .then(res => setSubmissions(res.data))
        .catch(err => console.error(err));
    } else {
      // Student → get only their submissions
      API.get(`/students/${studentId}/submissions`)
        .then(res => setSubmissions(res.data))
        .catch(err => console.error(err));
    }
  }, [quizId, studentId, isTeacher]);

  if (isTeacher) {
    // ===== Teacher Dashboard =====
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">👨‍🏫 All Student Submissions</h1>

        {submissions.length === 0 ? (
          <p className="text-gray-500">No submissions yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Student</th>
                <th className="p-3">Score</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.submissionId}
                  className="hover:bg-gray-50 border-b"
                >
                  <td className="p-3">{sub.student?.username}</td>
                  <td className="p-3 font-semibold">
                    {sub.score}/{sub.totalQuestions}
                  </td>
                  <td className="p-3">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/teacher-dashboard/${quizId}/submission/${sub.submissionId}`)
                      }
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // ===== Student Dashboard =====
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 My Quiz Attempts</h1>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.submissionId}
              className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() =>
                navigate(`/student-dashboard/${quizId}/submission/${sub.submissionId}`)
              }
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-lg">{sub.quizTitle}</p>
                <p className="font-semibold">
                  Score: {sub.score}/{sub.totalQuestions}
                </p>
                <p className="text-gray-500">
                  {new Date(sub.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

