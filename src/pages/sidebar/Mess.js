import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../constants/API";
import { FaUtensils, FaCheck, FaHistory, FaRupeeSign } from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

export default function MessDashboard() {
  const [today, setToday] = useState({ jain: 0, nonJain: 0 });
  const [manual, setManual] = useState({ jain: "", nonJain: "" });
  const [history, setHistory] = useState([]);
  const [recent, setRecent] = useState([]);

  const [range, setRange] = useState({ from: "", to: "" });
  const [price, setPrice] = useState("");
  const [bill, setBill] = useState(null);

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [nextStart, setNextStart] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchToday();
    fetchHistory();
    fetchPaymentHistory();
    fetchNextStart();
  }, []);

  const fetchToday = async () => {
    const res = await axios.get(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const ov = res.data;
    const jain = Number(ov?.jain_students?.present || 0);
    const present = Number(ov?.present_today || 0);

    setToday({
      jain,
      nonJain: present - jain,
    });
  };

  const fetchHistory = async () => {
    const res = await axios.get(`${BASE_URL}/mess/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rows = res.data.records || [];
    setHistory(rows);
    setRecent(rows.slice(0, 7));
  };

  const saveToday = async () => {
    await axios.post(
      `${BASE_URL}/mess/save`,
      {
        date: new Date().toISOString().split("T")[0],
        jain_count: manual.jain || today.jain,
        non_jain_count: manual.nonJain || today.nonJain,
        created_by: "admin",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchHistory();
  };

  const calculateBill = async () => {
    const res = await axios.get(
      `${BASE_URL}/mess/range?from=${range.from}&to=${range.to}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const totals = res.data;

    setBill({
      total_plates: totals.total_plates,
      total_amount: totals.total_plates * price,
    });
  };

  const savePayment = async () => {
    await axios.post(
      `${BASE_URL}/mess/payment`,
      {
        from_date: range.from,
        to_date: range.to,
        total_plates: bill.total_plates,
        price_per_plate: price,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchPaymentHistory();
    fetchNextStart();
  };

  const fetchPaymentHistory = async () => {
    const res = await axios.get(`${BASE_URL}/mess/payment/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPaymentHistory(res.data.records || []);
  };

  const fetchNextStart = async () => {
    const res = await axios.get(`${BASE_URL}/mess/payment/next-start`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setNextStart(res.data.next_start);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-4xl font-extrabold mb-6 flex items-center">
        <FaUtensils className="text-indigo-600 mr-3" />
        Mess Dashboard
      </h1>

      {/* Today Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-xl bg-white shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Today's Count</h2>

          <div className="text-4xl font-bold text-green-700">Jain: {today.jain}</div>
          <div className="text-4xl font-bold text-blue-700">Non-Jain: {today.nonJain}</div>

          <p className="mt-3 text-gray-700">
            Total: <span className="font-bold">{today.jain + today.nonJain}</span>
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Manual Override</h2>

          <input
            type="number"
            placeholder="Jain count"
            className="w-full p-3 border rounded mb-3"
            onChange={(e) => setManual({ ...manual, jain: e.target.value })}
          />

          <input
            type="number"
            placeholder="Non-Jain count"
            className="w-full p-3 border rounded mb-3"
            onChange={(e) => setManual({ ...manual, nonJain: e.target.value })}
          />

          <button
            onClick={saveToday}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
          >
            <FaCheck /> Save
          </button>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white p-6 rounded-xl shadow-xl mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <FaRupeeSign className="mr-3" /> Billing
        </h2>

        <p className="text-gray-700 mb-2">
          Next unpaid period starts from:{" "}
          <span className="font-bold">
            {nextStart || new Date().toISOString().split("T")[0]}
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

          <Flatpickr
            options={{ dateFormat: "Y-m-d" }}
            className="p-3 border rounded"
            placeholder="Start Date"
            value={range.from || nextStart || new Date().toISOString().split("T")[0]}
            onChange={(d) => setRange({ ...range, from: d[0]?.toISOString().split("T")[0] })}
          />

          <Flatpickr
            options={{ dateFormat: "Y-m-d" }}
            className="p-3 border rounded"
            placeholder="End Date"
            onChange={(d) => setRange({ ...range, to: d[0]?.toISOString().split("T")[0] })}
          />

          <input
            type="number"
            placeholder="Price per plate"
            className="p-3 border rounded"
            onChange={(e) => setPrice(e.target.value)}
          />

          <button
            onClick={calculateBill}
            className="bg-purple-600 text-white font-bold py-3 rounded"
          >
            Calculate
          </button>
        </div>

        {bill && (
          <div className="text-lg font-bold">
            Total Plates: {bill.total_plates} <br />
            Total Amount: ₹{bill.total_amount}
            <br />
            <button
              onClick={savePayment}
              className="mt-3 bg-green-600 text-white py-2 px-6 rounded"
            >
              Save Payment
            </button>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <FaHistory className="mr-3 text-green-600" /> Payment History
        </h2>

        <div className="overflow-y-auto max-h-[300px] border rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Plates</th>
                <th className="p-3">Rate</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Paid On</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.from_date}</td>
                  <td className="p-3">{p.to_date}</td>
                  <td className="p-3">{p.total_plates}</td>
                  <td className="p-3">₹{p.price_per_plate}</td>
                  <td className="p-3 font-bold">₹{p.total_amount}</td>
                  <td className="p-3">{new Date(p.paid_on).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
