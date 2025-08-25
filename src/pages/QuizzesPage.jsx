import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axio";

export default function QuizzesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { materialId } = useParams();
  const [courseId, setCourseId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });
  const [answers, setAnswers] = useState({});
  const [bulkQuestions, setBulkQuestions] = useState([
    { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" },
  ]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [materialName, setMaterialName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.courseId) {
      setCourseId(location.state.courseId);
    } else {
      const storedCourseId = localStorage.getItem('currentCourseId');
      if (storedCourseId) {
        setCourseId(storedCourseId);
      } else {
        fetchCourseIdFromMaterial();
      }
    }
    checkUserRole();
    fetchQuiz();
    fetchMaterialName();
  }, [materialId, location]);

  const fetchMaterialName = async () => {
    try {
      const res = await API.get(`/materials/${materialId}`);
      if (res.data.title) {
        setMaterialName(res.data.title);
      }
    } catch (err) {
      console.error("Error fetching material details", err);
      setMaterialName(`Material #${materialId}`);
    }
  };

  const fetchCourseIdFromMaterial = async () => {
    try {
      const res = await API.get(`/materials/${materialId}`);
      if (res.data.courseId) {
        setCourseId(res.data.courseId);
        localStorage.setItem('currentCourseId', res.data.courseId);
      }
    } catch (err) {
      console.error("Error fetching material details", err);
    }
  };

  const checkUserRole = () => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_TEACHER") setIsTeacher(true);
  };

  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await API.get(`/quizzes/material/${materialId}`);
      if (res.data.length > 0) {
        setQuiz(res.data[0]);
        fetchQuestions(res.data[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching quiz", err);
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await API.get(`/quizzes/${quizId}/questions`);
      setQuestions(res.data);
      shuffleQuestions(res.data);
      
      if (isTeacher) {
        const correctAnswersMap = {};
        res.data.forEach(q => {
          correctAnswersMap[q.questionId] = q.correctAnswer;
        });
        setCorrectAnswers(correctAnswersMap);
      }
    } catch (err) {
      console.error("Error fetching questions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const shuffleQuestions = (questionsArray) => {
    const shuffled = [...questionsArray].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/quizzes/${quiz.id}/questions`, newQuestion);
      setNewQuestion({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      fetchQuestions(quiz.id);
    } catch (err) {
      console.error("Error adding question", err);
    }
  };

  const handleAddBulkQuestions = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/quizzes/${quiz.id}/questions/bulk`, { questions: bulkQuestions });
      setBulkQuestions([{ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" }]);
      fetchQuestions(quiz.id);
    } catch (err) {
      console.error("Error adding bulk questions", err);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/quizzes/material/${materialId}`, { title: newQuizTitle });
      setQuiz(res.data);
      setNewQuizTitle("");
    } catch (err) {
      console.error("Error creating quiz", err);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm("Are you sure you want to delete this quiz and all its questions?")) return;
    try {
      await API.delete(`/quizzes/${quiz.id}`);
      setQuiz(null);
      setQuestions([]);
      setShuffledQuestions([]);
      setSubmissionResult(null);
      alert("Quiz deleted successfully.");
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data);
      } else {
        alert("Failed to delete quiz. Please try again.");
      }
      console.error("Error deleting quiz", err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await API.delete(`/quizzes/questions/${questionId}`);
      fetchQuestions(quiz.id);
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data);
      } else {
        alert("Failed to delete question. Please try again.");
      }
      console.error("Error deleting question", err);
    }
  };

  const handleBulkChange = (index, field, value) => {
    const updated = [...bulkQuestions];
    updated[index][field] = value;
    setBulkQuestions(updated);
  };

  const addBulkRow = () => {
    setBulkQuestions([...bulkQuestions, { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" }]);
  };

  const removeBulkRow = (index) => {
    if (bulkQuestions.length === 1) return;
    const updated = bulkQuestions.filter((_, i) => i !== index);
    setBulkQuestions(updated);
  };

  const handleSelectAnswer = (questionId, option) => {
    if (submissionResult) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const payload = {
      studentId: parseInt(localStorage.getItem("userId")),
      answers: questions.map((q) => ({
        questionId: q.questionId,
        selectedAnswer: answers[q.questionId] || "",
      })),
    };
    try {
      const res = await API.post(`/quizzes/${quiz.id}/submissions`, payload);
      
      const correctAnswersMap = {};
      questions.forEach(q => {
        correctAnswersMap[q.questionId] = q.correctAnswer;
      });
      setCorrectAnswers(correctAnswersMap);
      
      setSubmissionResult({
        score: res.data.score,
        totalQuestions: res.data.totalQuestions,
      });
      alert(`Submitted! Score: ${res.data.score}/${res.data.totalQuestions}`);
    } catch (err) { 
      console.error(err); 
      alert("Failed to submit quiz"); 
    }
  };

  const handleReattempt = () => {
    setSubmissionResult(null);
    setAnswers({});
    shuffleQuestions(questions);
  };

  const handleBackToMaterials = () => {
    if (courseId) {
      navigate(`/materials/course/${courseId}`);
    } else {
      navigate("/materials");
    }
  };

  const isAnswerCorrect = (questionId) => {
    if (!submissionResult) return false;
    return answers[questionId] === correctAnswers[questionId];
  };

  const getCorrectAnswer = (questionId) => {
    return correctAnswers[questionId];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Quiz: {materialName || `Material #${materialId}`}</h1>
                <p className="text-blue-100 mt-2">Test your knowledge on this material</p>
              </div>
              <button
                onClick={handleBackToMaterials}
                className="bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium backdrop-blur-sm border border-white/30"
              >
                Back to Materials
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
            {!quiz && isTeacher && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Create New Quiz</h2>
                </div>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quiz Title</label>
                    <input
                      type="text"
                      placeholder="Enter Quiz Title"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create Quiz
                  </button>
                </form>
              </div>
            )}

            {quiz ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                {/* Quiz Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">{quiz.title}</h2>
                      <p className="text-gray-600 mt-1">{shuffledQuestions.length} questions</p>
                    </div>
                    {isTeacher && (
                      <button
                        onClick={handleDeleteQuiz}
                        className="bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Quiz
                      </button>
                    )}
                  </div>
                  
                  {submissionResult && (
                    <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-800">
                          Your Score: {submissionResult.score}/{submissionResult.totalQuestions}
                        </h3>
                      </div>
                      <p className="text-blue-600 mt-1 text-sm">Hover over questions to see correct answers</p>
                      
                      {!isTeacher && (
                        <div className="mt-4">
                          <button
                            onClick={handleReattempt}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Teacher Forms */}
                {isTeacher && (
                  <>
                    {/* Add Single Question Form */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Add New Question</h3>
                      </div>
                      <form onSubmit={handleAddQuestion} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Question Text</label>
                          <input
                            type="text"
                            placeholder="Enter your question here"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={newQuestion.questionText}
                            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {["A", "B", "C", "D"].map((opt) => (
                            <div key={opt} className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Option {opt}</label>
                              <input
                                type="text"
                                placeholder={`Option ${opt}`}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={newQuestion[`option${opt}`]}
                                onChange={(e) => setNewQuestion({ ...newQuestion, [`option${opt}`]: e.target.value })}
                                required
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                          <select
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={newQuestion.correctAnswer}
                            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Add Question
                        </button>
                      </form>
                    </div>

                    {/* Bulk Add Questions Form */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Bulk Add Questions</h3>
                      </div>
                      
                      <form onSubmit={handleAddBulkQuestions} className="space-y-6">
                        {bulkQuestions.map((q, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Question Text</label>
                              <input 
                                type="text" 
                                placeholder="Enter question text" 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                value={q.questionText} 
                                onChange={(e) => handleBulkChange(idx, "questionText", e.target.value)} 
                                required 
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {["A", "B", "C", "D"].map((opt) => (
                                <div key={opt} className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Option {opt}</label>
                                  <input 
                                    type="text" 
                                    placeholder={`Option ${opt}`} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                    value={q[`option${opt}`]} 
                                    onChange={(e) => handleBulkChange(idx, `option${opt}`, e.target.value)} 
                                    required 
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                                <select 
                                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                  value={q.correctAnswer} 
                                  onChange={(e) => handleBulkChange(idx, "correctAnswer", e.target.value)}
                                >
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="D">D</option>
                                </select>
                              </div>
                              <button 
                                type="button" 
                                className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center" 
                                onClick={() => removeBulkRow(idx)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex space-x-4">
                          <button 
                            type="button" 
                            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center" 
                            onClick={addBulkRow}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Add Another Question
                          </button>
                          <button 
                            type="submit" 
                            className="bg-green-700 text-white px-4 py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Bulk Questions
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}

                {/* Questions List */}
                <div className="p-6">
                  {shuffledQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {shuffledQuestions.map((q, idx) => (
                        <div 
                          key={q.questionId} 
                          className={`border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 relative
                            ${submissionResult ? (isAnswerCorrect(q.questionId) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : ''}`}
                        >
                          {submissionResult && (
                            <div className="absolute top-4 right-4 group">
                              <span className="text-gray-400 cursor-help text-sm bg-white p-1.5 rounded-full border border-gray-200">ℹ️</span>
                              <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10">
                                <span className="font-medium">Correct answer:</span> {q[`option${getCorrectAnswer(q.questionId)}`]}
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-5">
                            <p className="text-lg font-medium text-gray-800 mb-5">
                              <span className="text-blue-600 font-semibold">Q{idx + 1}:</span> {q.questionText}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {["A", "B", "C", "D"].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => handleSelectAnswer(q.questionId, opt)}
                                  className={`border rounded-xl p-4 text-left transition-all duration-200 ${
                                    answers[q.questionId] === opt
                                      ? submissionResult 
                                        ? (isAnswerCorrect(q.questionId) && answers[q.questionId] === opt
                                          ? "bg-green-100 border-green-500 shadow-inner"
                                          : "bg-red-100 border-red-500 shadow-inner")
                                        : "bg-blue-100 border-blue-500 shadow-inner"
                                      : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                                  } ${submissionResult && getCorrectAnswer(q.questionId) === opt ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                                  disabled={submissionResult !== null}
                                >
                                  <span className="font-semibold text-gray-700 mr-2">{opt}.</span> 
                                  <span>{q[`option${opt}`]}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {isTeacher && (
                            <button
                              onClick={() => handleDeleteQuestion(q.questionId)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Question
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No questions yet</h3>
                      <p className="text-gray-500">Add questions to create your quiz</p>
                    </div>
                  )}
                </div>

                {/* Submit Button for Students */}
                {!isTeacher && shuffledQuestions.length > 0 && !submissionResult && (
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 shadow-lg">
                    <div className="max-w-4xl mx-auto flex justify-end">
                      <button
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !isTeacher && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No quiz available</h3>
                  <p className="text-gray-500">The teacher hasn't created a quiz for this material yet</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}