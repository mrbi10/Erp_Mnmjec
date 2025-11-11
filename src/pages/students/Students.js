import React, { useEffect, useState, useMemo } from "react";
import { FaSpinner, FaUserGraduate, FaSearch } from "react-icons/fa";
import Select from "react-select";
import { BASE_URL } from "../../constants/API";
import Swal from "sweetalert2";
import {motion} from "framer-motion";


const DEPT_MAP = {
  1: "CSE",
  2: "ECE",
  3: "EEE",
  4: "MECH",
  5: "CIVIL",
  6: "IT",
};

const romanMap = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
};

export default function Students({ user }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ multiFilters: [] });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 7;


  const token = localStorage.getItem("token");

  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ jain: false, hostel: false, bus: false });
  const [saving, setSaving] = useState(false);

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      jain: !!student.jain,
      hostel: !!student.hostel,
      bus: !!student.bus,
    });
  };

  const handleSave = async () => {
    const confirm = await
      Swal.fire({
        title: "Save changes?",
        text: "This will update the student's information in the database.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save it",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton:
            "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded",
          cancelButton:
            "bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded ml-2",
        },
        buttonsStyling: false,
      });


    if (!confirm.isConfirmed) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/student/${editingStudent.student_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: "Updated!",
          text: "Student details were successfully updated.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Update local list immediately
        setStudents((prev) =>
          prev.map((s) =>
            s.student_id === editingStudent.student_id ? { ...s, ...editForm } : s
          )
        );
        setEditingStudent(null);
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message || "Failed to update student.",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Error saving student:", err);
      Swal.fire({
        title: "Server Error",
        text: "Something went wrong while saving changes.",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };



  // --- Fetch classes (for principal dropdown) ---
  useEffect(() => {
    if (user?.role !== "Principal") return;
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [user, token]);

  // --- Fetch students based on role ---
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        let url = "";
        if (user?.role === "Principal") {
          url = selectedClass
            ? `${BASE_URL}/classes/${selectedClass}/students`
            : `${BASE_URL}/students`; // all students
        } else if (user?.assigned_class_id) {
          url = `${BASE_URL}/classes/${user.assigned_class_id}/students`;
        } else {
          setLoading(false);
          return;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, token, selectedClass]);

  // --- Apply filters + search ---
  useEffect(() => {
    let result = [...students];
    const { multiFilters } = filters;

    if (multiFilters.length > 0) {
      result = result.filter((s) => {
        // Normalize all fields to booleans
        const jain = s.jain === true || s.jain === 1 || s.jain === "1";
        const hostel = s.hostel === true || s.hostel === 1 || s.hostel === "1";
        const bus = s.bus === true || s.bus === 1 || s.bus === "1";

        return multiFilters.every((filter) => {
          switch (filter) {
            case "Jain":
              return jain;
            case "Non-Jain":
              return !jain;
            case "Hostel":
              return hostel;
            case "DayScholar":
              return !hostel;
            case "Bus":
              return bus;
            case "NoBus":
              return !bus;
            default:
              return true;
          }
        });
      });
    }

    if (search.trim() !== "") {
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.roll_no?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [filters, search, students]);


  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };


  // --- React Select options for Principal class filter ---
  const classOptions = useMemo(
    () => [
      { value: "", label: "All Classes" },
      ...classes.map((c) => ({
        value: c.class_id,
        label: `Year ${c.year} - ${DEPT_MAP[c.dept_id] || "Dept"}`,
      })),
    ],
    [classes]
  );

 if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 animate-pulse">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-4"
        >
          <FaSpinner className="text-5xl text-blue-600 dark:text-blue-400" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="text-lg font-semibold tracking-wide"
        >
          Loading Students...
        </motion.h2>
      </div>
    );
  }


  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        <FaUserGraduate className="text-red-600 mr-3" />
        {user?.role === "Principal"
          ? "All Students Overview"
          : `Students of Class ${user?.assigned_class_id || ""}`}
      </h1>

      {/* --- Filters for Principal --- */}
      {user?.role === "Principal" && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center mb-6">
          {/* Class Filter */}
          <div className="w-full sm:w-64">
            <Select
              options={classOptions}
              value={classOptions.find((o) => o.value === selectedClass)}
              onChange={(opt) => setSelectedClass(opt?.value || "")}
              placeholder="Filter by Class"
              isSearchable
            />
          </div>

          {/* Combined Multi Filter */}
          <div className="w-full sm:w-72">
            <Select
              isMulti
              options={[
                { value: "Jain", label: "Jain" },
                { value: "Non-Jain", label: "Non-Jain" },
                { value: "Hostel", label: "Hostel" },
                { value: "DayScholar", label: "Day Scholar" },
                { value: "Bus", label: "College Bus" },
                { value: "NoBus", label: "No Bus" },
              ]}
              value={filters.multiFilters.map((f) => ({
                value: f,
                label:
                  f === "Jain"
                    ? "Jain"
                    : f === "Non-Jain"
                      ? "Non-Jain"
                      : f === "Hostel"
                        ? "Hostel"
                        : f === "DayScholar"
                          ? "Day Scholar"
                          : f === "Bus"
                            ? "College Bus"
                            : "No Bus",
              }))}
              onChange={(selected) =>
                setFilters({
                  ...filters,
                  multiFilters: selected ? selected.map((s) => s.value) : [],
                })
              }
              placeholder="Filter by Type"
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "8px",
                  borderColor: "#d1d5db",
                  minHeight: "38px",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#e0f2fe",
                  color: "#0369a1",
                }),
              }}

            />
          </div>


          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or reg no"
              className="pl-9 pr-3 py-2 w-full border rounded-lg text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* --- Student Table --- */}
      {filteredStudents.length === 0 ? (
        <div className="p-6 bg-white rounded-xl shadow-md text-center text-gray-500">
          No students found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Reg No
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Dept / Year
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Jain / Non-Jain
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Hostel / Day Scholar
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  College Bus / No Bus
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((s) => (
                <tr
                  key={s.student_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">
                    {s.roll_no || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                    {`${DEPT_MAP[s.dept_id] || "Dept"} - ${romanMap[s.class_id]}`}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                    {s.email}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                    {s.mobile}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    {s.jain ? (
                      <span className="text-green-700 font-semibold">Jain</span>
                    ) : (
                      <span className="text-gray-700">Non-Jain</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    {s.hostel ? (
                      <span className="text-blue-700 font-semibold">
                        Hostel
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        Day Scholar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    {s.bus ? (
                      <span className="text-blue-700 font-semibold">
                        College Bus
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
          {/* Pagination Controls */}
          {filteredStudents.length > studentsPerPage && (
            <div className="flex justify-center items-center py-4 gap-2 text-sm flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                Prev
              </button>

              {/* Smart Pagination Numbers */}
              {(() => {
                const pageButtons = [];
                const maxVisible = 4;

                if (totalPages <= maxVisible + 2) {
                  for (let i = 1; i <= totalPages; i++) {
                    pageButtons.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    pageButtons.push(1, 2, 3, 4, "...", totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pageButtons.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pageButtons.push(
                      1,
                      "...",
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      "...",
                      totalPages
                    );
                  }
                }

                return pageButtons.map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${page === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                    >
                      {page}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                Next
              </button>
            </div>
          )}

          {editingStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg w-80 p-6 relative">
                <h2 className="text-lg font-bold mb-4 text-gray-800">
                  Edit Student: {editingStudent.name}
                </h2>

                <div className="space-y-3">
                  {/* Jain */}
                  <div className="flex justify-between items-center">
                    <span>Jain</span>
                    <input
                      type="checkbox"
                      checked={editForm.jain}
                      onChange={(e) => setEditForm({ ...editForm, jain: e.target.checked })}
                    />
                  </div>

                  {/* Hostel */}
                  <div className="flex justify-between items-center">
                    <span>Hostel</span>
                    <input
                      type="checkbox"
                      checked={editForm.hostel}
                      onChange={(e) =>
                        setEditForm({ ...editForm, hostel: e.target.checked })
                      }
                    />
                  </div>

                  {/* Bus */}
                  <div className="flex justify-between items-center">
                    <span>College Bus</span>
                    <input
                      type="checkbox"
                      checked={editForm.bus}
                      onChange={(e) => setEditForm({ ...editForm, bus: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
