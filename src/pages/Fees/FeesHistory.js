import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../constants/API";

const FeesHistory = ({ reg_no }) => {
  const { token } = localStorage.getItem('token');
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await fetch(`${BASE_URL}/fees/history/${reg_no}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Payment History</h2>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.date}</td>
              <td className="p-2">₹{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p>No payments made</p>}
    </div>
  );
};

export default FeesHistory;
