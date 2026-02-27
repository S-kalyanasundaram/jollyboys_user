import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./dashboard.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function JollyBoysDashboard() {
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [groupData, setGroupData] = useState(null);

  const login = async () => {
    const { data: user } = await supabase
      .from("amount_2026")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!user) {
      alert("User Not Found");
      return;
    }

    setUserData(user);

    const { data: loan } = await supabase
      .from("loan_details")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setLoanData(loan);
    

    const { data: members } = await supabase
      .from("amount_2026")
      .select("*");

    const { data: loans1 } = await supabase
      .from("loan_details")
      .select("loan_total");

    const { data: loans } = await supabase
      .from("loan_details")
      .select("loan_amount, status_id");
    


    calculateGroup(members, loans,loans1);
  };




  const calculateGroup = (members, loans,loans1) => {
  let total_2024 = 0;
  let total_2025 = 0;
  let total_2026 = 0;
  let total_fine = 0;

  let ongoing_total = 0;   // status 1
  let closed_adjustment = 0; // status 2 difference only

  members.forEach((m) => {
    total_2024 += m.balance_2024 || 0;
    total_2025 += m.balance_2025 || 0;
    total_2026 += m.balance_2026 || 0;
    total_fine += m.fine_2026 || 0;
  });

  loans.forEach((l) => {
    if (l.status_id === 1) {
      // Still outside money
      ongoing_total += l.loan_amount || 0;
    } else if (l.status_id === 2) {
      // Loan closed → add back only once
      closed_adjustment += l.loan_amount || 0;
    }
  });

  const totalLoanPaid = loans1
    ? loans1.reduce((sum, k) => sum + (k.loan_total || 0), 0)
    : 0;

  

  const whole_total =
    total_2024 +
    total_2025 +
    total_2026 +
    total_fine +
    totalLoanPaid

  setGroupData({
    total_2024,
    total_2025,
    total_2026,
    total_fine,
    status1_total: ongoing_total,
    status2_total: closed_adjustment,
    whole_total,
    totalLoanPaid,
  });
};

  const card = (title, value, color) => (
    <div className={`card ${color}`}>
      <div className="card-title">{title}</div>
      <div className="card-value">₹ {value}</div>
    </div>
  );

  return (
    <div className="main-bg">
      {!userData && (
        <div className="login-box">
          <h2>🔐 Jolly Boys Finance</h2>
          <input
            type="number"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </div>
      )}

      {userData && (
        <div className="dashboard">
          <h1 className="welcome">
            👋 Welcome, <span>{userData.name}</span>
          </h1>

          {/* USER DASHBOARD */}
          <h2>User Dashboard</h2>
          <div className="grid">
            {card("2024 Balance", userData.balance_2024, "purple")}
            {card("2025 Balance", userData.balance_2025, "blue")}
            {card("2026 Balance", userData.balance_2026, "cyan")}
            {card("Fine 2026", userData.fine_2026, "orange")}
            {card("Total", userData.total, "green")}
          </div>

          {/* LOAN */}
          {loanData && (
            <>
              <h2>Loan Details</h2>
              <div className="grid">
                {card("Loan Amount", loanData.loan_amount, "red")}
                {card("Loan Total Paid", loanData.loan_total, "blue")}
                {card(
                  "Status",
                  loanData.status_id === 1 ? "Ongoing" : "Closed",
                  loanData.status_id === 1 ? "red" : "green"
                )}
              </div>
            </>
          )}

          {/* GROUP DASHBOARD */}
          {groupData && (
            <>
              <h2>Group Dashboard</h2>
              <div className="grid">
                {card("Total 2024", groupData.total_2024, "purple")}
                {card("Total 2025", groupData.total_2025, "blue")}
                {card("Total 2026", groupData.total_2026, "cyan")}
                {card("Total Fine", groupData.total_fine, "orange")}
                {card("Ongoing Loan Total", groupData.status1_total, "red")}
                {card("Closed Loan Total", groupData.status2_total, "blue")}
                {card("Whole Total", groupData.whole_total - groupData.status1_total, "green")}
              </div>
            </>
          )}
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <h3>
            Created by <span>Sk Sundar</span>
          </h3>
          <p>Sk Sundar Tech Solution</p>
          <p className="copyright">
            © {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}