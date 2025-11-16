import React, { useEffect, useState } from "react";
import Select from "react-select";
import { BASE_URL } from "../../constants/API";

export default function FeesAnalytics({ user }) {
  const [classes, setClasses] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);

  const [filters, setFilters] = useState({
    dept_id: "",
    year: "",
    fee_type: "",
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ===========================
  // REACT-SELECT OPTIONS
  // ===========================
  const deptOptions = [
    { value: "1", label: "CSE" },
    { value: "2", label: "AIDS" },
    { value: "3", label: "AI & DS" },
    { value: "4", label: "CSBS" },
    { value: "5", label: "MECH" },
    { value: "6", label: "CIVIL" },
    { value: "7", label: "ECE" },
    { value: "8", label: "EEE" },
  ];

  const feeTypeOptions = [
    { value: "", label: "All Fees" },
    { value: "SEMESTER", label: "Semester Fee" },
    { value: "HOSTEL", label: "Hostel Fee" },
    { value: "TRANSPORT", label: "Transport Fee" },
  ];

  const yearOptions = filteredYears.map((yr) => ({
    value: yr,
    label: `${yr} Year`,
  }));

  // ===========================
  // LOAD CLASSES
  // ===========================
  const fetchClasses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setClasses(json);
    } catch (err) {
      console.log("Error loading classes:", err);
    }
  };

  // ===========================
  // FILTER YEARS BASED ON DEPT
  // ===========================
  useEffect(() => {
    if (!filters.dept_id) {
      setFilteredYears([]);
      return;
    }

    const deptClasses = classes.filter(
      (c) => c.dept_id == filters.dept_id
    );
    const uniqueYears = [...new Set(deptClasses.map((c) => c.year))];

    setFilteredYears(uniqueYears);
  }, [filters.dept_id, classes]);

  // ===========================
  // FETCH ANALYTICS DATA
  // ===========================
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();

      const res = await fetch(`${BASE_URL}/fees/analytics?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      setData(json.data || null);
    } catch (err) {
      console.log("Error fetching analytics:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchAnalytics(); // Auto-update when filters change
  }, [filters]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600 mb-6">
        <h1 className="text-2xl font-bold">Fees Analytics</h1>
        <p className="text-gray-600 mb-4">View summaries and analysis.</p>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            options={deptOptions}
            placeholder="Department"
            value={deptOptions.find((o) => o.value === filters.dept_id)}
            onChange={(val) =>
              setFilters({ ...filters, dept_id: val?.value || "", year: "" })
            }
          />

          <Select
            options={yearOptions}
            placeholder="Year"
            value={yearOptions.find((o) => o.value === filters.year) || null}
            onChange={(val) =>
              setFilters({ ...filters, year: val?.value || "" })
            }
            isDisabled={!filters.dept_id}
          />

          <Select
            options={feeTypeOptions}
            placeholder="Fee Type"
            value={feeTypeOptions.find((o) => o.value === filters.fee_type)}
            onChange={(val) =>
              setFilters({ ...filters, fee_type: val?.value || "" })
            }
          />
        </div>
      </div>

      {/* ANALYTICS CARD */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {loading ? (
          <p>Loading...</p>
        ) : data ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="p-4 border rounded-lg shadow">
                <p className="text-gray-500">Total Students</p>
                <h3 className="text-2xl font-bold">{data.total_students}</h3>
              </div>

              <div className="p-4 border rounded-lg shadow">
                <p className="text-gray-500">Total Fee</p>
                <h3 className="text-2xl font-bold">₹{data.total_amount}</h3>
              </div>

              <div className="p-4 border rounded-lg shadow">
                <p className="text-gray-500">Total Collected</p>
                <h3 className="text-2xl font-bold">₹{data.total_paid}</h3>
              </div>

              <div className="p-4 border rounded-lg shadow">
                <p className="text-gray-500">Pending Due</p>
                <h3 className="text-2xl font-bold text-red-500">
                  ₹{data.total_due}
                </h3>
              </div>

            </div>
          </>
        ) : (
          <p>No analytics found for selected filters.</p>
        )}
      </div>
    </div>
  );
}
