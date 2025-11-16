import React, { useState } from "react";
import { BASE_URL } from "../../constants/API";

const FeesAddPayment = ({ reg_no, refresh }) => {
  const { token } = localStorage.getItem('token');
  const [amount, setAmount] = useState("");

  const submit = async () => {
    if (!amount) return alert("Enter amount");

    await fetch(`${BASE_URL}/fees/payment/${reg_no}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    refresh();
    setAmount("");
    alert("Payment added");
  };

  return (
    <div className="bg-white p-5 rounded shadow mb-5">
      <h2 className="text-lg font-semibold mb-3">Add Payment</h2>

      <input
        type="number"
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default FeesAddPayment;
