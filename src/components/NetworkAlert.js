import { useEffect, useState } from "react";
import {BASE_URL} from "../constants/API";

export default function NetworkAlert() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${BASE_URL}/status`, {
          method: "GET",
          timeout: 3000, 
        });
        if (!res.ok) throw new Error("Bad response");
        setShow(false);
      } catch {
        setShow(true);
      }
    };

    // initial check + interval every 10s
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div style={popupStyle}>
      <div style={contentStyle}>
        <h4 style={{ marginBottom: 6 }}>Server Unreachable</h4>
        <p style={{ margin: 0, fontSize: 14 }}>
          Connect to the <strong>college Wi-Fi</strong> to access this page.
        </p>
      </div>
    </div>
  );
}

const popupStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  background: "#f44336",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: "8px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
  zIndex: 10000,
  transition: "all 0.3s ease",
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
};
