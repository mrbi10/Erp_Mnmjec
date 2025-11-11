import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PrincipalDashboard from "./dashboard/PrincipalDashboard";
import { BASE_URL } from "../constants/API"; // Ensure this file exists or replace with your base URL
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaClock,
  FaBell,
  FaBook,
  FaFileDownload,
  FaUserEdit,
  FaCalendarAlt,
  FaReceipt,
  FaMoneyBillAlt,
  FaSearch,
  FaEnvelopeOpenText,
  FaGraduationCap,
} from "react-icons/fa";

// Charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- Component Definition ---

export default function EnhancedDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState({});
  const [profile, setProfile] = useState();

  const [Timetable, setTimeTable] = useState();

  
  const [student, setStudent] = useState(null);
  // const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [datewiseAttendance, setDatewiseAttendance] = useState([]);
    

    const token = localStorage.getItem('token');

  // Utility function to decode JWT payload (kept as is)
  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const studentData = decodeToken(token);
    if (!studentData) {
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Ensure studentData.roll_no is correctly mapped to the backend expectation
        const res = await axios.get(
          `${BASE_URL}/attendance/student/${studentData.roll_no}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const attendance = Array.isArray(res.data) ? res.data : [];
        console.log("+++++++++++++++++AAAAAAAAAAAAAAAAAA",attendance)

        // --- Core Concept Logic ---
        const totalClasses = attendance.length;
        const presentCount = attendance.filter(a => a.status === "Present").length;
        const absentCount = attendance.filter(a => a.status === "Absent").length;
        const percentage = totalClasses ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

        

        const datewise = attendance
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort newest first
          .map(a => ({
            date: new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: a.status
          }));
        setDatewiseAttendance(datewise);

        setStudent({ name: studentData.name, email: studentData.email, roll_no: studentData.roll_no });
        // --- End Core Concept Logic ---

      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  // --- Placeholder Generators (Ensure consistent structure) ---

  function placeholderAttendanceSummary() {
    return {
      totalPercentage: 82,
      subjectWise: [
        { name: "Maths", percent: 88 },
        { name: "DBMS", percent: 75 },
        { name: "OS", percent: 80 },
        { name: "AI", percent: 70 },
      ],
      recent: [
        { date: new Date().toISOString(), status: "Present" },
        { date: new Date(Date.now() - 86400000).toISOString(), status: "Absent" },
        { date: new Date(Date.now() - 2 * 86400000).toISOString(), status: "Present" },
      ],
    };
  }

  function placeholderPerformance() {
    return {
      cgpa: 8.4,
      semesterGpa: 8.6,
      subjects: [
        { name: "Maths", grade: "A", marks: 88 },
        { name: "DBMS", grade: "B+", marks: 78 },
        { name: "OS", grade: "A", marks: 84 },
      ],
      rank: 12,
    };
  }

  function placeholderTimetable() {
    // Note: Start and End Times are now full time strings for accurate countdown
    return {
      today: [
        { startTime: "09:00:00", endTime: "10:00:00", subject: "Mathematics", room: "Room 101" },
        { startTime: "10:00:00", endTime: "11:00:00", subject: "Data Structures", room: "Lab C" },
        { startTime: "11:00:00", endTime: "12:00:00", subject: "DBMS", room: "Room 204" },
      ],
    };
  }

  function placeholderAnnouncements() {
    return [
      { id: 1, title: "Re-Evaluation Forms", date: "2025-10-01", body: "Apply by Oct 10" },
      { id: 2, title: "Guest Lecture", date: "2025-10-05", body: "AI talk at 2PM in Auditorium." },
    ];
  }

  function placeholderAssignments() {
    return [
      { id: 1, title: "DBMS - Assignment 2", dueDate: "2025-10-25", status: "pending" },
      { id: 2, title: "OS - Lab Report", dueDate: "2025-10-22", status: "pending" },
    ];
  }

  function placeholderFees() {
    return { paid: 50000, pending: 0, lastReceiptUrl: null };
  }

  function placeholderLibrary() {
    return { borrowed: [{ title: "Clean Code", dueDate: "2025-10-29" }], fines: 0 };
  }

  function placeholderClassSummary() {
    return { totalStudents: 58, averageAttendance: 81, subjectsHandled: ["DBMS", "OS"] };
  }

  function placeholderAdminStats() {
    return { staffCount: 15, courseCount: 5, activeUsers: 300 };
  }

  // --- Data Fetching ---

  // 1. Fetch User Profile/Details (less frequent)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // Assuming the /profile endpoint provides user-specific details like name, regNo, course
        const res = await axios.get(`${BASE_URL}/profile`, { 
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Fallback to user prop if profile fetch fails
        setProfile(user); 
      }
    };

     
    
    // Only fetch the profile if the `user` prop is provided, otherwise rely on `user` prop.
    if (user && user.role) {
      fetchUserProfile();
    } else {
        setProfile(user);
    }
  }, [user]);

   useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // Assuming the /profile endpoint provides user-specific details like name, regNo, course
        const res = await axios.get(`${BASE_URL}/timetable/today`, { 
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimeTable(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Fallback to user prop if profile fetch fails
        setTimeTable(user); 
      }
    };
    // Only fetch the profile if the `user` prop is provided, otherwise rely on `user` prop.
    if (user && user.role) {
      fetchUserProfile();
    } else {
        setTimeTable(user);
    }
  }, [user]);

  // 2. Fetch Dashboard Widget Data (main dashboard content)
  useEffect(() => {
    let mounted = true;

    const token = localStorage.getItem("token"); // change if auth method differs

    const api = axios.create({
      baseURL: BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // A. Try a consolidated call first (recommended backend approach)
        const dashboardRes = await api.get(`/dashboard`)
          .then((r) => r.data)
          .catch(() => null);

        // If the backend provides a complete dashboard object, use it.
        if (dashboardRes && Object.keys(dashboardRes).length > 0) {
          if (!mounted) return;
          setPayload(dashboardRes);
          return;
        }
        
        // B. Otherwise fetch pieces in parallel and merge (fallback)
        // Only fetch relevant data based on user role to save bandwidth/time
        let fetches = [];
        if (user.role === "student") {
            fetches = [
                api.get(`/attendance/summary`).then((r) => r.data).catch(() => null),
                api.get(`/performance`).then((r) => r.data).catch(() => null),
                api.get(`/timetable/today`).then((r) => r.data).catch(() => null),
                api.get(`/announcements`).then((r) => r.data).catch(() => null),
                api.get(`/assignments`).then((r) => r.data).catch(() => null),
                api.get(`/fees`).then((r) => r.data).catch(() => null),
                api.get(`/library`).then((r) => r.data).catch(() => null),
            ];
        } else if (user.role === "staff") {
            fetches = [
                api.get(`/class/summary`).then((r) => r.data).catch(() => null),
                api.get(`/assignments`).then((r) => r.data).catch(() => null),
                api.get(`/announcements`).then((r) => r.data).catch(() => null),
            ];
        } else if (user.role === "admin") {
             fetches = [
                api.get(`/stats/summary`).then((r) => r.data).catch(() => null),
                api.get(`/announcements`).then((r) => r.data).catch(() => null),
            ];
        } else {
            // Default/Unknown role fetches minimum data
            fetches = [
                api.get(`/announcements`).then((r) => r.data).catch(() => null),
            ];
        }


        const results = await Promise.all(fetches);
        
        let merged = {};
        const adminStats = placeholderAdminStats(); // For admin fallback

        if (user.role === "student") {
            merged = {
                attendanceSummary: results[0] || placeholderAttendanceSummary(),
                performance: results[1] || placeholderPerformance(),
                timetableToday: results[2] || placeholderTimetable(),
                announcements: results[3] || placeholderAnnouncements(),
                assignments: results[4] || placeholderAssignments(),
                fees: results[5] || placeholderFees(),
                library: results[6] || placeholderLibrary(),
            };
        } else if (user.role === "staff") {
            merged = {
                classSummary: results[0] || placeholderClassSummary(),
                assignments: results[1] || placeholderAssignments(),
                announcements: results[2] || placeholderAnnouncements(),
            };
        } else if (user.role === "admin") {
            merged = {
                // If the single endpoint fails, use classSummary as a fallback for some stats
                classSummary: results[0]?.classSummary || placeholderClassSummary(),
                staffCount: results[0]?.staffCount || adminStats.staffCount,
                courseCount: results[0]?.courseCount || adminStats.courseCount,
                activeUsers: results[0]?.activeUsers || adminStats.activeUsers,
                announcements: results[1] || placeholderAnnouncements(),
            };
        }
        
        // Add common announcements for non-student roles
        if (user.role !== "student" && !merged.announcements) {
             merged.announcements = results[results.length - 1] || placeholderAnnouncements();
        }


        if (!mounted) return;
        setPayload(merged);
      } catch (e) {
        console.error("Dashboard Fetch Error:", e);
        if (!mounted) return;
        setError("Failed to load dashboard data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    
    // Only run fetchAll if the user role is available
    if (user && user.role) {
      fetchAll();
    } else {
        setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user]); // Depend on user to re-run fetch when role changes

  // --- Derived Components ---

  const AttendanceCard = ({ attendance }) => {
    const pct = attendance?.totalPercentage ?? 0;
    const color = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";

    const barData = useMemo(() => ({
      labels: (attendance?.subjectWise || []).map((s) => s.name),
      datasets: [
        {
          label: "Attendance %",
          data: (attendance?.subjectWise || []).map((s) => s.percent),
          backgroundColor: "#0ea5e9", // Tailwind sky-500
        },
      ],
    }), [attendance]);

    return (
      <div className="p-6 bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaClock className="text-2xl text-sky-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">Attendance Overview</h3>
              <p className="text-sm text-gray-600">Subject-wise and overall record</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-white font-bold text-lg ${color}`}>{pct}%</div>
            <div className="text-xs text-gray-500">Overall</div>
          </div>
        </div>

        <div className="mb-4 h-48">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { suggestedMin: 0, suggestedMax: 100, ticks: { callback: (val) => val + "%" } },
                x: { grid: { display: false } }
              },
            }}
          />
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2 border-t pt-2">Recent Attendance</h4>
          <ul className="space-y-2 max-h-36 overflow-y-auto">
            {(attendance?.recent || []).slice(0, 5).map((r, idx) => (
              <li key={idx} className={`p-2 rounded flex justify-between items-center transition duration-150 ${r.status === "Present" ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"}`}>
                <span className="text-sm">{new Date(r.date).toLocaleDateString()}</span>
                <span className={`${r.status === "Present" ? "text-green-700" : "text-red-700"} font-semibold text-sm`}>{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const PerformanceCard = ({ performance }) => {
    const lineData = useMemo(() => ({
      labels: (performance?.subjects || []).map((s) => s.name),
      datasets: [
        { 
          label: "Marks", 
          data: (performance?.subjects || []).map((s) => s.marks), 
          fill: false,
          borderColor: '#1d4ed8', // blue-700
          tension: 0.1,
        },
      ],
    }), [performance]);

    return (
      <div className="p-6 bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaGraduationCap className="text-2xl text-sky-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">Academic Performance</h3>
              <p className="text-sm text-gray-600">Latest CGPA and subject scores</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-blue-700">{performance?.cgpa?.toFixed(2) ?? "-"}</div>
            <div className="text-xs text-gray-500">Latest CGPA</div>
          </div>
        </div>

        <div className="mb-4 h-48">
          <Line
            data={lineData}
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { suggestedMin: 0, suggestedMax: 100 },
                x: { grid: { display: false } }
              }
            }}
          />
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2 border-t pt-2">Semester Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
             <div className="p-2 bg-blue-50 rounded">Semester GPA: <span className="font-bold text-blue-800">{performance?.semesterGpa?.toFixed(2) ?? "-"}</span></div>
             <div className="p-2 bg-blue-50 rounded">Class Rank: <span className="font-bold text-blue-800">{performance?.rank ?? "-"}</span></div>
          </div>
          
          <ul className="mt-4 space-y-2">
            {(performance?.subjects || []).map((s, idx) => (
              <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded transition duration-150 hover:bg-gray-100">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">Grade: <span className="font-semibold text-gray-700">{s.grade}</span></div>
                </div>
                <div className="text-right font-bold text-gray-800">{s.marks}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const TimetableCard = ({ today }) => {
    console.log("PPPPPPPPPPP",today);
    const todayClasses = today?.today || [];

    // Helper to convert HH:MM:SS to a Date object for today
    const getTimeAsDate = (timeString) => {
        if (!timeString) return null;
        const [h, m, s] = timeString.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, s, 0);
        return date;
    };

    const nextClass = useMemo(() => {
        const now = new Date();
        // Find the first class whose start time is in the future
        const upcoming = todayClasses.find((cls) => {
            const classTime = getTimeAsDate(cls.startTime);
            return classTime && classTime > now;
        });

        // If no future class, check if a class is currently ongoing
        if (!upcoming) {
            return todayClasses.find((cls) => {
                const startTime = getTimeAsDate(cls.startTime);
                const endTime = getTimeAsDate(cls.endTime);
                return startTime && endTime && startTime <= now && endTime > now;
            });
        }
        return upcoming;

    }, [todayClasses]);

    const formatTime = (time) => {
      const [h, m] = time.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    };

    const getStatus = (cls) => {
        const now = new Date();
        const startTime = getTimeAsDate(cls.startTime);
        const endTime = getTimeAsDate(cls.endTime);

        if (!startTime || !endTime) return "N/A";
        
        if (startTime <= now && endTime > now) {
            return { text: "Ongoing", color: "text-green-600 font-bold" };
        } else if (startTime > now) {
            const diffMs = startTime - now;
            const diffMins = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return { text: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`, color: "text-blue-600 font-medium" };
        } else {
            return { text: "Finished", color: "text-gray-400" };
        }
    };
    
    // Countdown for the *next* class that hasn't started
    const nextClassCountdown = useMemo(() => {
        if (!nextClass || getStatus(nextClass).text === "Ongoing") return "Now";
        if (getStatus(nextClass).text === "Finished") return "N/A";
        return getStatus(nextClass).text;
    }, [nextClass]);


    return (
      <div className="p-6 bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaCalendarAlt className="text-2xl text-sky-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">Today's Timetable</h3>
              <p className="text-sm text-gray-600">{new Date().toDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-700">
              Next Class: <span className="font-bold text-lg text-blue-700">{nextClassCountdown}</span>
            </div>
          </div>
        </div>

        {todayClasses.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
            🎉 No classes scheduled today. Enjoy!
          </div>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {todayClasses.map((cls, idx) => {
                const status = getStatus(cls);
                const isNext = nextClass?.startTime === cls.startTime && status.text !== "Finished";
                return (
                    <li
                        key={idx}
                        className={`p-3 rounded flex justify-between items-center border ${isNext ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'} transition duration-150 hover:shadow-md`}
                    >
                        <div>
                            <div className="font-semibold text-gray-800">{cls.subject}</div>
                            <div className="text-xs text-gray-500">{cls.room}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-700 font-mono">
                                {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                            </div>
                            <div className={`text-xs ${status.color}`}>
                                {isNext && status.text === "Ongoing" ? "LIVE" : status.text}
                            </div>
                        </div>
                    </li>
                );
            })}
          </ul>
        )}
      </div>
    );
  };


  const AnnouncementsCard = ({ announcements }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-4 border-b pb-2">
        <FaBell className="text-2xl text-red-500 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Latest Announcements</h3>
      </div>
      <ul className="space-y-3 max-h-64 overflow-y-auto">
        {(announcements || []).slice(0, 5).map((a) => (
          <li key={a.id || a.title} className="p-3 bg-red-50 rounded border-l-4 border-red-300 transition duration-150 hover:bg-red-100">
            <div className="flex justify-between items-start">
              <div className="pr-2">
                <div className="font-semibold text-red-800">{a.title}</div>
                <div className="text-xs text-red-500 mt-1">{a.date}</div>
                <div className="text-sm mt-2 text-gray-700">{a.body}</div>
              </div>
              <div>
                <button className="text-xs underline text-red-600 hover:text-red-800">View</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {(announcements || []).length === 0 && <p className="text-gray-500 text-sm p-2 text-center">No new announcements.</p>}
    </div>
  );

  const AssignmentsCard = ({ assignments }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-4 border-b pb-2">
        <FaFileDownload className="text-2xl text-green-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Assignments & Due Dates</h3>
      </div>
      <ul className="space-y-3 max-h-64 overflow-y-auto">
        {(assignments || []).slice(0, 5).map((a) => (
          <li key={a.id} className="p-3 rounded bg-green-50 border-l-4 border-green-300 flex justify-between items-center transition duration-150 hover:bg-green-100">
            <div>
              <div className="font-medium text-gray-800">{a.title}</div>
              <div className="text-xs text-gray-500">Due: <span className="font-semibold text-green-700">{a.dueDate}</span></div>
            </div>
            <div className={`text-sm font-semibold ${a.status === "pending" ? "text-red-600" : "text-green-600"}`}>
              {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
            </div>
          </li>
        ))}
      </ul>
      {(assignments || []).length === 0 && <p className="text-gray-500 text-sm p-2 text-center">No pending assignments.</p>}
    </div>
  );

  const FeesCard = ({ fees }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-4 border-b pb-2">
        <FaMoneyBillAlt className="text-2xl text-teal-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Fee Status</h3>
      </div>
      <div className="flex items-center justify-between text-center">
        <div>
          <div className="text-sm text-gray-500">Paid</div>
          <div className="font-bold text-2xl text-teal-700">₹{(fees?.paid ?? 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="border-l border-r px-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className={`font-bold text-2xl ${fees?.pending > 0 ? "text-red-600" : "text-green-600"}`}>₹{(fees?.pending ?? 0).toLocaleString('en-IN')}</div>
        </div>
        <div>
          {fees?.lastReceiptUrl ? (
            <a href={fees.lastReceiptUrl} target="_blank" rel="noreferrer" className="underline text-sm text-blue-600 hover:text-blue-800 flex items-center">
              <FaReceipt className="mr-1" /> Receipt
            </a>
          ) : (
            <button className="text-sm text-gray-500 hover:text-gray-700">Pay Now</button>
          )}
        </div>
      </div>
    </div>
  );

  const LibraryCard = ({ library }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-4 border-b pb-2">
        <FaBook className="text-2xl text-purple-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Library Summary</h3>
      </div>
      <div className="space-y-3">
        {(library?.borrowed || []).map((b, idx) => (
          <div key={idx} className="p-3 bg-purple-50 rounded flex justify-between items-center border-l-4 border-purple-300 transition duration-150 hover:bg-purple-100">
            <div>
              <div className="font-medium text-gray-800">{b.title}</div>
              <div className="text-xs text-gray-500">Due: <span className="font-semibold">{b.dueDate}</span></div>
            </div>
            <div className="text-sm font-semibold text-red-600">Fines: ₹{(library?.fines ?? 0).toLocaleString('en-IN')}</div>
          </div>
        ))}
        {(library?.borrowed || []).length === 0 && <p className="text-gray-500 text-sm p-2 text-center">No books currently borrowed.</p>}
      </div>
    </div>
  );

  const ProfileCard = ({ profileData }) => {
    console.log("_+++++++++++++", profileData);
    if (!profileData) return null;

    const courseMap = {
      1: "CSE",
      2: "Data Science",
      3: "Information Technology",
      4: "Electronics & Communication",
      5: "Electrical & Electronics",
    };

    const courseName = courseMap[profileData.dept_id] || "Unknown";
    const courseDisplay = profileData.role === "student" ? `B.E - ${courseName}` : profileData.role === "staff" ? "Faculty" : "Admin";

    // Semester calculation logic only for student role
    const semester = (() => {
      if (profileData.role !== "student" || !profileData.class_id) return "N/A";
      const year = parseInt(profileData.class_id, 10); // class_id might represent admission year
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const academicYear = currentYear - year + 1; // Assuming class_id is the year of entry (e.g., '2022')
      
      // Typical Indian academic year: Odd Sem (Jul-Dec), Even Sem (Jan-Jun)
      // Semester = (Academic Year * 2) - (currentMonth < 7 ? 1 : 0)
      const isOddSem = currentMonth >= 7 && currentMonth <= 12; // Jul-Dec = odd
      const calculatedSem = (academicYear * 2) - (isOddSem ? 1 : 2); // 1st year: 1 or 2; 2nd year: 3 or 4, etc.

      // Fallback for simple calculation if `class_id` is just the current year level (e.g., 1, 2, 3, 4)
      const yearLevel = parseInt(profileData.class_id, 10);
      if (yearLevel >= 1 && yearLevel <= 4) {
          return (yearLevel * 2) - (isOddSem ? 1 : 0);
      }
      
      return calculatedSem > 0 ? calculatedSem : "-";
    })();


    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-sky-600">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-extrabold text-gray-900">{profileData.name}</div>
            
            
            <div className="text-sm text-gray-500">{profileData.regNo || profileData.employeeId || "ID: -"}</div>
          </div>
          {/* <div className="flex items-center gap-3">
            <button className="px-3 py-1 rounded bg-sky-600 text-white text-sm flex items-center hover:bg-sky-700 transition">
              <FaUserEdit className="mr-2" /> Edit
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 border-t pt-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500">Role/Designation</span>
            <span className="font-medium">{profileData.role}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500">Course/Dept</span>
            <span className="font-medium">{courseDisplay}</span>
          </div>
          {profileData.role === "student" && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">Current Semester</span>
              <span className="font-medium">{semester}</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500">Mobile</span>
            <span className="font-medium">{profileData.mobile || "-"}</span>
          </div>
          <div className="col-span-2 flex flex-col">
            <span className="text-xs font-semibold text-gray-500">Email</span>
            <span className="font-medium truncate">{profileData.email || "-"}</span>
          </div>
        </div>
      </div>
    );
  };

  if (user.role === "principal") {
  return <PrincipalDashboard />;
}


  // --- Main Render ---

  if (loading) return (
    <div className="p-6 min-h-screen bg-sky-50 flex items-center justify-center">
      <div className="text-lg font-semibold text-sky-700 flex items-center">
        <FaChartLine className="animate-pulse mr-3" /> Loading enhanced dashboard...
      </div>
    </div>
  );
  if (error) return (
    <div className="p-6 text-red-600 bg-red-100 border border-red-400 rounded-lg m-4">
      <FaExclamationTriangle className="inline mr-2" /> Error: {error}
    </div>
  );

  // payload contains the merged data and merged admin stats if applicable
  const { attendanceSummary, performance, timetableToday, announcements, assignments, fees, library, classSummary, staffCount, courseCount, activeUsers } = payload;
  const userProfile = profile || user; // Use fetched profile or prop fallback

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-sky-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div>
          <h1 className="text-4xl font-extrabold text-sky-900">Welcome, <span className="text-blue-700">{userProfile.name?.split(' ')[0] || userProfile.name}</span>!</h1>
          <div className="text-lg text-sky-700 mt-1">
            Role: <span className="font-bold uppercase">{userProfile.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 font-medium">
            <FaCalendarAlt className="inline mr-2 text-sky-600" />
            {new Date().toLocaleString()}
          </div>
          <button className="bg-white p-3 rounded-full shadow-lg text-sky-600 hover:bg-sky-50 transition"><FaSearch /></button>
        </div>
      </div>
      
      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">Primary Overview</h2>
          
          {/* Student Specific Widgets */}
          {user.role === "student" && (
            <>
              <AttendanceCard attendance={attendanceSummary} />
              <PerformanceCard performance={performance} />
              <TimetableCard timetable={timetableToday} />
            </>
          )}

          {/* Staff Specific Widgets */}
          {user.role === "staff" && (
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500">
                <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center"><FaChartLine className="mr-3" /> Class Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
                    <div className="text-xl font-extrabold text-blue-800">{classSummary?.totalStudents ?? "-"}</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
                    <div className="text-xl font-extrabold text-blue-800">{classSummary?.averageAttendance}%</div>
                    <div className="text-sm text-gray-600">Avg Attendance</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
                    <div className="text-xl font-extrabold text-blue-800">{classSummary?.subjectsHandled?.length ?? "-"}</div>
                    <div className="text-sm text-gray-600">Subjects Handled</div>
                  </div>
                </div>
              </div>
              <AssignmentsCard assignments={assignments} />
            </div>
          )}

          {/* Admin Specific Widgets */}
          {user.role === "admin" && (
            <div className="space-y-6">
                <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-purple-500">
                    <h3 className="text-2xl font-bold mb-4 text-purple-700 flex items-center"><FaChartLine className="mr-3" /> System Overview</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
                            <div className="text-xl font-extrabold text-purple-800">{classSummary?.totalStudents ?? "-"}</div>
                            <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
                            <div className="text-xl font-extrabold text-purple-800">{staffCount ?? "-"}</div>
                            <div className="text-sm text-gray-600">Total Staff</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
                            <div className="text-xl font-extrabold text-purple-800">{courseCount ?? "-"}</div>
                            <div className="text-sm text-gray-600">Total Courses</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
                            <div className="text-xl font-extrabold text-purple-800">{activeUsers ?? "-"}</div>
                            <div className="text-sm text-gray-600">Active Users</div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          
          
          {/* Common Widgets for Staff/Admin if not using a dedicated assignment card */}
          {(user.role === "staff" || user.role === "admin") && !assignments && (
             <AssignmentsCard assignments={assignments} />
          )}

        </div>

        {/* Sidebar/Utility Area (1/3 width on large screens) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">Utilities & Notices</h2>
          <ProfileCard profileData={userProfile} />
          <AnnouncementsCard announcements={announcements} />
          
          {user.role === "student" && (
            <>
              <AssignmentsCard assignments={assignments} />
              <FeesCard fees={fees} />
              <LibraryCard library={library} />
            </>
          )}
          
        </div>
      </div>
    </div>
  );
}