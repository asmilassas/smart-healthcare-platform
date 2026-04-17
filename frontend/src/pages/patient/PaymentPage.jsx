import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const loadAppointment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.getAppointment(id);
      setAppointment(res.data);
    } catch (err) {
      console.error("Fetch appointment error:", err);
      setError(err.response?.data?.message || "Failed to load appointment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const handlePayment = async () => {
    if (!appointment) return;

    setPaying(true);
    setError("");

    try {
      const payload =
        appointment.type === "in-person"
          ? {
              onsiteDetails:
                "Please visit the hospital/clinic at the selected time.",
            }
          : {};

      const res = await api.mockPayAppointment(id, payload);

      alert(res.data?.message || "Payment successful!");
      navigate("/patient/appointments");
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-state">Loading payment details…</div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="error-msg">Appointment not found.</div>
        </div>
      </div>
    );
  }

  const canPay =
    appointment.status === "confirmed" &&
    appointment.paymentStatus === "unpaid";

  return (
    <div className="page-wrapper">
      <div className="container">
        <div
          className="card"
          style={{
            maxWidth: 650,
            margin: "0 auto",
            padding: 24,
          }}
        >
          <h1 style={{ marginBottom: 8 }}>Payment Page</h1>
          <p style={{ marginBottom: 20, color: "var(--text-muted)" }}>
            Complete your payment to secure this appointment.
          </p>

          {error && (
            <div className="error-msg" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            <p>
              <strong>Doctor:</strong> {appointment.doctorName}
            </p>
            <p>
              <strong>Specialty:</strong> {appointment.specialty}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appointment.appointmentDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {appointment.timeSlot?.startTime} -{" "}
              {appointment.timeSlot?.endTime}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {appointment.type === "telemedicine"
                ? "📹 Telemedicine"
                : "🏥 In-person"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge badge-${appointment.status}`}>
                {appointment.status}
              </span>
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span className={`badge badge-${appointment.paymentStatus}`}>
                {appointment.paymentStatus}
              </span>
            </p>
            <p>
              <strong>Consultation Fee:</strong> LKR{" "}
              {appointment.consultationFee?.toLocaleString?.() ??
                appointment.consultationFee}
            </p>
          </div>

          {appointment.status === "pending" && (
            <div className="warning-banner" style={{ marginTop: 18 }}>
              Waiting for doctor confirmation before payment.
            </div>
          )}

          {appointment.paymentStatus === "paid" && (
            <div className="success-banner" style={{ marginTop: 18 }}>
              This appointment has already been paid.
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-accent"
              onClick={handlePayment}
              disabled={!canPay || paying}
            >
              {paying ? "Processing..." : "Confirm Payment"}
            </button>

            <button
              className="btn btn-outline"
              onClick={() => navigate("/patient/appointments")}
              disabled={paying}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .warning-banner {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: var(--warning-light);
          color: var(--warning);
          font-size: 0.88rem;
        }
        .success-banner {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: var(--success-light);
          color: var(--success);
          font-size: 0.88rem;
        }
      `}</style>
    </div>
  );
}