import React, { useEffect, useMemo, useState } from "react";
import { FaBook, FaCalendarAlt, FaUtensils, FaArrowRight, FaCheckCircle, FaExclamationCircle, FaClock, FaEnvelopeOpenText, FaFileDownload, FaGraduationCap, FaMoneyBillAlt, FaBell } from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import Select from "react-select";
import axios from "axios";
import { BASE_URL } from "../../constants/API";


// --- Design Tokens (Consistent Styling) ---
const CARD_CLASSES = "p-6 bg-white rounded-2xl border border-gray-100 shadow-xl transition duration-500 hover:shadow-2xl hover:border-sky-200 h-full flex flex-col";
const HEADER_ICON_COLOR = "text-sky-600";
const HEADER_TEXT_CLASSES = "text-xl font-semibold text-gray-800 tracking-tight";
const SUBHEADER_TEXT_CLASSES = "text-sm text-gray-500 font-light";
const ACCENT_COLOR_CLASSES = "text-sky-600 font-bold";
const PRIMARY_BUTTON_CLASSES = "px-4 py-2 bg-sky-600 text-white font-medium rounded-xl hover:bg-sky-700 transition duration-300 shadow-md";

// UTILITY FUNCTION
const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m}`;
};
const formatdatetime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        weekday: "short",
    });
}

// 1. ATTENDANCE CARD (Restyled for Minimalism)
const AttendanceCard = ({ profileData, token }) => {
    const [studentData, setStudentData] = useState([]);

    const fetchStudentData = async () => {
        try {
            const res = await fetch(`${BASE_URL}/attendance/student/${profileData?.regNo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setStudentData(data);
        } catch {
            setStudentData([]);
        }
    };

    useEffect(() => {
        if (!profileData?.regNo) return;
        fetchStudentData();
    }, [profileData?.regNo, token]);


    //--------------------------------------------------------
    // CUMULATIVE DAILY PERCENTAGES (MAIN CHART)
    //--------------------------------------------------------

    const cumulativeTrend = useMemo(() => {
        if (!studentData.length) return [];

        const sorted = [...studentData].sort((a, b) => new Date(a.date) - new Date(b.date));

        let presentCount = 0;

        return sorted.map((record, index) => {
            if (record.status === "Present" || record.status === "P") {
                presentCount++;
            }

            const totalDays = index + 1;
            const pct = (presentCount / totalDays) * 100;

            return {
                date: new Date(record.date).toLocaleDateString(),
                pct: Number(pct.toFixed(2))
            };
        }).slice(-15); // keep only last 15 days
    }, [studentData]);



    //--------------------------------------------------------
    // Overall percent (from cumulative)
    //--------------------------------------------------------

    const overallPercentage = cumulativeTrend.length
        ? cumulativeTrend[cumulativeTrend.length - 1].pct
        : 0;

    const overallBgColor =
        overallPercentage >= 75 ? "bg-green-500"
            : overallPercentage >= 50 ? "bg-yellow-500"
                : "bg-red-500";


    //--------------------------------------------------------
    // Chart data
    //--------------------------------------------------------

    const lineData = {
        labels: cumulativeTrend.map(d => d.date),
        datasets: [
            {
                label: "",
                data: cumulativeTrend.map(d => d.pct),
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(14,165,233,0.2)",
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: () => null,
                    label: ctx => `${ctx.raw}%`
                }
            }
        },
        scales: {
            y: { suggestedMin: 0, suggestedMax: 100 }
        }
    };


    //--------------------------------------------------------
    // Recent 5 logs
    //--------------------------------------------------------

    const recentStatus = useMemo(() => {
        return [...studentData]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [studentData]);


    //--------------------------------------------------------
    // UI
    //--------------------------------------------------------

    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col h-full border border-gray-100">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Attendance Analytics</h3>
                </div>

                <div className="flex flex-col items-end">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow ${overallBgColor}`}>
                        {Math.round(overallPercentage)}%
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-56 mb-6">
                <Line data={lineData} options={chartOptions} />
            </div>

            {/* Button */}
            <button
                onClick={() => window.location.href = "#/Erp_Mnmjec/attendance/view"}
                className="w-full py-2 bg-sky-600 text-white rounded-xl mb-4 hover:bg-sky-700 transition"
            >
                Detailed Attendance Overview
            </button>


        </div>
    );
};



// 2. MESS MENU CARD (Restyled for Minimalism)
const MessMenuCard = ({ messMenu, isJain }) => {
    const [selectedDay, setSelectedDay] = useState(
        new Date().toLocaleDateString("en-US", { weekday: "long" })
    );

    if (!messMenu || !Array.isArray(messMenu) || messMenu.length === 0) {
        return <div className={CARD_CLASSES}><p className="text-center text-gray-500">Menu data loading...</p></div>;
    }

    const selectedMenu = messMenu.find((m) => m.day === selectedDay);
    const menu = isJain ? selectedMenu?.jain : selectedMenu?.non_jain;
    const menuType = isJain ? "Jain" : "Standard";

    return (
        <div className={CARD_CLASSES}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <FaUtensils className={`text-2xl ${HEADER_ICON_COLOR} mr-3`} />
                    <div>
                        <h3 className={HEADER_TEXT_CLASSES}>
                            {menuType} Mess Menu
                        </h3>
                        <p className={SUBHEADER_TEXT_CLASSES}>Daily Meal Breakdown</p>
                    </div>
                </div>
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                >
                    {messMenu.map((m, idx) => (
                        <option key={idx} value={m.day}>{m.day}</option>
                    ))}
                </select>
            </div>

            <h4 className={`text-lg font-semibold mb-3 ${ACCENT_COLOR_CLASSES}`}>{selectedDay}'s Menu</h4>

            {!menu ? (
                <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">Menu not available for this day.</p>
            ) : (
                <div className="space-y-3">
                    {Object.entries(menu).map(([key, val], idx) =>
                        val ? (
                            <div key={idx} className="p-3 rounded-xl bg-gray-50 flex justify-between items-start hover:bg-sky-50 transition duration-150 border-l-4 border-sky-100">
                                <span className="font-semibold capitalize text-gray-700 pr-4">{key.replace(/_/g, " ")}:</span>{" "}
                                <span className="text-gray-800 text-right flex-1">{val}</span>
                            </div>
                        ) : null
                    )}
                </div>
            )}
            <p className="mt-4 text-xs text-gray-400 text-right">Preference: {menuType}</p>
        </div>
    );
};

// 3. PERFORMANCE CARD (Restyled for Minimalism)
const PerformanceCard = ({ performance }) => {
    const lineData = useMemo(() => ({
        labels: (performance?.subjects || []).map((s) => s.name.split(' ').map(w => w.charAt(0)).join('')), // Use initials
        datasets: [
            {
                label: "Marks",
                data: (performance?.subjects || []).map((s) => s.marks),
                fill: false,
                borderColor: '#1d4ed8', // Dark Blue for professional look (indigo-700)
                backgroundColor: 'rgba(29, 78, 216, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#1d4ed8',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    }), [performance]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.raw}`,
                    title: (context) => (performance?.subjects || [])[context[0].dataIndex]?.name || context[0].label
                }
            }
        },
        scales: {
            y: { suggestedMin: 0, suggestedMax: 100, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
    };

    return (
        <div className={CARD_CLASSES}>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                    <FaGraduationCap className={`text-2xl ${HEADER_ICON_COLOR} mr-3`} />
                    <div>
                        <h3 className={HEADER_TEXT_CLASSES}>Academic Performance</h3>
                        <p className={SUBHEADER_TEXT_CLASSES}>Latest CGPA and Subject Scores</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-extrabold text-blue-700">{performance.cgpa}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">Latest CGPA</div>
                </div>
            </div>

            <div className="mb-6 h-52 flex-grow">
                <Line data={lineData} options={chartOptions} />
            </div>

            <div className="mt-auto">
                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="font-medium text-gray-700">Semester GPA:</span> <span className="font-bold text-blue-800 text-lg ml-1">{performance.semesterGpa}</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="font-medium text-gray-700">Class Rank:</span> <span className="font-bold text-blue-800 text-lg ml-1">{performance.ranking}</span>
                    </div>
                </div>

                <ul className="mt-4 space-y-2 max-h-36 overflow-y-auto pr-2">
                    {(performance?.subjects || []).map((s, idx) => (
                        <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded-lg transition duration-150 hover:bg-gray-100 border-l-2 border-gray-200">
                            <div>
                                <div className="font-medium text-sm text-gray-800">{s.name}</div>
                                <div className="text-xs text-gray-500">Grade: <span className="font-semibold text-gray-700">{s.grade}</span></div>
                            </div>
                            <div className="text-right font-bold text-lg text-blue-800">{s.marks}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// 4. TIMETABLE CARD (Restyled for Minimalism)
const TimetableCard = ({ timetableToday }) => {
    const todayClasses = timetableToday || [];

    const getTimeAsDate = (timeString) => {
        if (!timeString) return null;
        const [h, m, s] = timeString.split(":").map(Number);
        const date = new Date();
        // Reset date parts to today's date
        date.setHours(h, m, s, 0);
        return date;
    };

    const getStatus = (cls) => {
        const now = new Date();
        const startTime = getTimeAsDate(cls.startTime);
        const endTime = getTimeAsDate(cls.endTime);

        if (!startTime || !endTime) return { text: "N/A", color: "text-gray-400" };

        if (startTime <= now && endTime > now) {
            return { text: "Ongoing", color: "text-green-600 font-bold" };
        } else if (startTime > now) {
            const diffMs = startTime - now;
            const diffMins = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return {
                text: hours > 0 ? `${hours}h ${mins}m` : (mins > 0 ? `${mins}m` : 'Soon'),
                color: "text-sky-600 font-semibold"
            };
        } else {
            return { text: "Finished", color: "text-gray-400" };
        }
    };

    // Find the next upcoming or currently ongoing class
    const nextClass = useMemo(() => {
        const now = new Date();
        // First check for ongoing class
        const ongoing = todayClasses.find((cls) => {
            const startTime = getTimeAsDate(cls.startTime);
            const endTime = getTimeAsDate(cls.endTime);
            return startTime && endTime && startTime <= now && endTime > now;
        });

        if (ongoing) return ongoing;

        // Then check for the next upcoming class
        const upcoming = todayClasses.find((cls) => {
            const classTime = getTimeAsDate(cls.startTime);
            return classTime && classTime > now;
        });

        return upcoming;
    }, [todayClasses]);

    const nextClassStatus = nextClass ? getStatus(nextClass) : { text: "None", color: "text-gray-500" };
    const nextClassCountdown = nextClassStatus.text === "Ongoing" ? "LIVE" : nextClassStatus.text;


    return (
        <div className={CARD_CLASSES}>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                    <FaCalendarAlt className={`text-2xl ${HEADER_ICON_COLOR} mr-3`} />
                    <div>
                        <h3 className={HEADER_TEXT_CLASSES}>Today's Schedule</h3>
                        <p className={SUBHEADER_TEXT_CLASSES}>{new Date().toDateString()}</p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="text-sm text-gray-700">Next Class:</div>
                    <div className={`text-2xl font-extrabold ${nextClassCountdown === "LIVE" ? 'text-green-600' : ACCENT_COLOR_CLASSES}`}>
                        {nextClassCountdown}
                    </div>
                </div>
            </div>

            {todayClasses.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 text-lg font-light flex-grow flex items-center justify-center">
                    🎉 No classes scheduled today. Enjoy your break!
                </div>
            ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 flex-grow">
                    {todayClasses.map((cls, idx) => {
                        const status = getStatus(cls);
                        const isNext = nextClass?.startTime === cls.startTime && status.text !== "Finished";
                        return (
                            <li
                                key={idx}
                                className={`p-3 rounded-xl flex justify-between items-center border transition duration-150 ${isNext ? 'bg-sky-50 border-sky-300 shadow-md' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                            >
                                <div className='flex-1 pr-3'>
                                    <div className="font-semibold text-gray-800 text-base">{cls.subject}</div>
                                    <div className="text-xs text-gray-500 font-light mt-0.5">{cls.room}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-700 font-medium">
                                        {formatTime(cls.startTime)} <span className='text-gray-400'>-</span> {formatTime(cls.endTime)}
                                    </div>
                                    <div className={`text-xs mt-0.5 ${status.color}`}>
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
}

// 5. ANNOUNCEMENTS CARD (Restyled for Minimalism)
export const AnnouncementsCard = ({ announcements }) => (
    <div className={CARD_CLASSES}>
        <div className="flex items-center mb-6 border-b pb-3">
            <FaBell className="text-2xl text-red-500 mr-3" />
            <h3 className={HEADER_TEXT_CLASSES}>Latest Announcements</h3>
        </div>
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 flex-grow">
            {(announcements || []).slice(0, 5).map((a) => (
                <li key={a.id || a.title} className="p-3 bg-red-50 rounded-xl border-l-4 border-red-300 transition duration-150 hover:bg-red-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="pr-2">
                            <div className="font-semibold text-red-800 text-sm">{a.title}</div>
                            <div className="text-sm mt-1 text-gray-700 font-light">{a.message}</div>
                            <div className="text-xs text-red-500 mt-2">{formatdatetime(a.created_at)}</div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
        {(announcements || []).length === 0 && <p className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-xl mt-3">No new announcements.</p>}
    </div>
);

// 6. ASSIGNMENTS CARD (Restyled for Minimalism)
export const AssignmentsCard = ({ assignments }) => (
    <div className={CARD_CLASSES}>
        <div className="flex items-center mb-6 border-b pb-3">
            <FaFileDownload className="text-2xl text-green-600 mr-3" />
            <h3 className={HEADER_TEXT_CLASSES}>Assignments & Due Dates</h3>
        </div>
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 flex-grow">
            {(assignments || []).slice(0, 5).map((a) => (
                <li key={a.id} className="p-3 rounded-xl bg-green-50 border-l-4 border-green-300 flex justify-between items-center transition duration-150 hover:bg-green-100 shadow-sm">
                    <div className='flex-1 pr-3'>
                        <div className="font-medium text-gray-800 text-sm">{a.title}</div>
                        <div className="text-xs text-gray-500 mt-1">Due: <span className="font-semibold text-green-700">{formatdatetime(a.due_date)}</span></div>
                    </div>
                    <div className={`text-sm font-bold ${a.status === "pending" ? "text-red-600" : "text-green-600"}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </div>
                </li>
            ))}
        </ul>
        {(assignments || []).length === 0 && <p className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-xl mt-3">No pending assignments.</p>}
    </div>
);

// 7. FEES CARD (Restyled for Minimalism)
const FeesCard = ({ fees }) => {
    if (!fees) return <div className={CARD_CLASSES}><p className="text-center text-gray-500">Fees data loading...</p></div>;

    const statusColor =
        fees.balance > 0 ? "text-red-600 bg-red-50 border-red-200" :
            fees.payment_status === "Partial" ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                "text-green-600 bg-green-50 border-green-200";

    const balanceText = fees.balance > 0 ? "Outstanding" : "Zero Balance";

    return (
        <div className={CARD_CLASSES}>
            {/* Header */}
            <div className="flex items-center mb-6 border-b pb-3">
                <FaMoneyBillAlt className="text-2xl text-teal-600 mr-3" />
                <h3 className={HEADER_TEXT_CLASSES}>Fee Status</h3>
            </div>

            {/* Main Balance Display (Focus/Apple Style) */}
            <div className={`p-5 rounded-2xl border ${statusColor} text-center mb-6 shadow-lg`}>
                <div className="text-sm font-medium text-gray-600">{balanceText}</div>
                <div className="font-extrabold text-4xl sm:text-5xl my-1">
                    ₹{(fees.balance ?? 0).toLocaleString("en-IN")}
                </div>
                {/* <div className={`font-semibold text-sm mt-1 ${fees.balance > 0 ? "text-red-700" : "text-green-700"}`}>
                    {fees.payment_status || "N/A"}
                </div> */}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm flex-grow">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500">Total Paid</div>
                    <div className="font-bold text-lg text-teal-700 mt-1">
                        ₹{(fees.amount_paid ?? 0).toLocaleString("en-IN")}
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500">Updated</div>
                    <div className="font-bold text-lg text-gray-800 mt-1">
                        {new Date(fees.updated_at).toLocaleDateString("en-IN")}
                    </div>
                </div>
            </div>

            {/* Remarks */}
            {fees.remarks && fees.remarks.trim() && (
                <div className="mt-4 p-3 bg-gray-100 rounded-xl text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">Note:</span> {fees.remarks}
                </div>
            )}

            {fees.balance > 0 && (
                <button
                    onClick={() =>
                        window.open(
                            "https://www.erpteamtrust.com/teamtrustonline/online/OnlinePaymentGateway.jsp",
                            "_blank"
                        )
                    }
                    className={`w-full mt-5 flex items-center justify-center py-2 rounded-xl font-medium shadow-md
                    bg-red-600 text-white hover:bg-red-700 transition`}
                >
                    Make Payment
                    <FaArrowRight className="ml-2 text-sm" />
                </button>
            )}


        </div>
    );
};


// Main Student Dashboard Component (Refactored Layout)
export default function StudentDashboard({
    profileData,
    profileCard,
    attendanceSummary,
    performance,
    timetableToday,
    announcements,
    assignments,
    fees,
    messMenu,
    token
}) {
    return (
        <div className="p-4 sm:p-8 min-h-screen bg-gray-100 font-sans">
            {/* Main Dashboard Container */}
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tighter">
                   <span className={ACCENT_COLOR_CLASSES}>Student</span> dashboard 
                </h1>

                {/* 1. Profile (Full Width) */}
                <div className="mb-8">
                    {/* Assuming profileCard is a pre-rendered component/element passed in */}
                    {React.cloneElement(profileCard, {
                        className: `p-6 bg-white rounded-2xl border border-gray-100 shadow-xl transition duration-500 hover:shadow-2xl h-full flex flex-col ${profileCard.props.className}`
                    })}
                </div>

                {/* 2. Primary Metrics: Timetable, Attendance (Reinstated), Mess Menu, Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    {/* Timetable - Col Span 2 */}
                    <div className="lg:col-span-2">
                        <TimetableCard timetableToday={timetableToday} />
                    </div>

                    {/* Attendance - Col Span 2 */}
                    <div className="lg:col-span-2">
                        <AttendanceCard profileData={profileData} token={token} />
                    </div>

                    {/* Mess Menu - Col Span 2 */}
                    <div className="lg:col-span-2">
                        <MessMenuCard messMenu={messMenu} isJain={profileData?.jain === 1} />
                    </div>

                    {/* Performance - Col Span 2 */}
                    <div className="lg:col-span-2">
                        <PerformanceCard performance={performance} />
                    </div>
                </div>

                {/* 3. Secondary/Action Items: Announcements, Assignments, Fees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Announcements */}
                    <div>
                        <AnnouncementsCard announcements={announcements} />
                    </div>

                    {/* Assignments */}
                    <div>
                        <AssignmentsCard assignments={assignments} />
                    </div>

                    {/* Fees */}
                    <div>
                        <FeesCard fees={fees} />
                    </div>
                </div>
            </div>
        </div>
    );
}