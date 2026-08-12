import {
  CheckSquare,
  Square,
  PhoneCall,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";

import { getAttendance, startAttendance } from "../services/api";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);

  const [status, setStatus] = useState("");

  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(true);

  const [starting, setStarting] = useState(false);

  const [message, setMessage] = useState("");

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const data = await getAttendance({
        status: status || undefined,
        limit: 100,
      });

      setAttendance(data.attendance || []);

      setSelected([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [status]);

  // ==========================================
  // SELECT / UNSELECT
  // ==========================================

  const toggleEmployee = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // ==========================================
  // SELECT ALL PENDING
  // ==========================================

  const selectAllPending = () => {
    const pendingIds = attendance
      .filter((item) => item.status === "PENDING")
      .map((item) => item.employeeId?._id)
      .filter(Boolean);

    setSelected(pendingIds);
  };

  // ==========================================
  // START AI CALLS
  // ==========================================

  const handleStartCalls = async () => {
    if (selected.length === 0) {
      return;
    }

    try {
      setStarting(true);
      setMessage("");

      const result = await startAttendance(selected);

      const successful = result.successful || 0;

      const failed = result.failed || 0;

      setMessage(
        `AI attendance started: ${successful} successful, ${failed} failed.`,
      );

      setSelected([]);

      await loadAttendance();
    } catch (error) {
      console.error("Start attendance error:", error);

      setMessage(
        error.response?.data?.message || "Failed to start AI attendance calls.",
      );
    } finally {
      setStarting(false);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const pendingEmployees = attendance.filter(
    (item) => item.status === "PENDING",
  );

  const allPendingSelected =
    pendingEmployees.length > 0 &&
    pendingEmployees.every((item) => selected.includes(item.employeeId?._id));

  return (
    <div>
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="page-heading">
        <div>
          <h2>Attendance</h2>

          <p>Manage today's attendance and AI verification</p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadAttendance}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* ======================================
          ACTION BAR
      ====================================== */}

      <div className="attendance-actions">
        <div className="toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>

            <option value="PRESENT">Present</option>

            <option value="LATE">Late</option>

            <option value="ABSENT">Absent</option>

            <option value="PENDING">Pending</option>

            <option value="REVIEW_REQUIRED">Review Required</option>
          </select>
        </div>

        <div className="attendance-buttons">
          <button
            className="secondary-btn"
            onClick={selectAllPending}
            disabled={pendingEmployees.length === 0}
          >
            <CheckSquare size={17} />
            Select All Pending
          </button>

          <button
            className="primary-btn"
            onClick={handleStartCalls}
            disabled={selected.length === 0 || starting}
          >
            {starting ? (
              <>
                <Loader2 size={17} className="spin" />
                Starting...
              </>
            ) : (
              <>
                <PhoneCall size={17} />
                Start AI Attendance
                {selected.length > 0 && ` (${selected.length})`}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ======================================
          RESULT MESSAGE
      ====================================== */}

      {message && <div className="action-message">{message}</div>}

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="panel">
        {loading ? (
          <div className="loading">Loading attendance...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Select</th>

                  <th>Employee</th>

                  <th>Location</th>

                  <th>Status</th>

                  <th>Verification</th>

                  <th>Check-in</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item) => {
                  const employee = item.employeeId;

                  const employeeId = employee?._id;

                  const isPending = item.status === "PENDING";

                  const isSelected = selected.includes(employeeId);

                  return (
                    <tr key={item._id}>
                      {/* SELECT */}

                      <td>
                        {isPending ? (
                          <button
                            className="select-button"
                            onClick={() => toggleEmployee(employeeId)}
                          >
                            {isSelected ? (
                              <CheckSquare size={18} />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        ) : (
                          <span className="disabled-select">—</span>
                        )}
                      </td>

                      {/* EMPLOYEE */}

                      <td>
                        <strong>{employee?.name}</strong>

                        <small>{employee?.employeeId}</small>
                      </td>

                      {/* LOCATION */}

                      <td>{item.locationId?.name || "—"}</td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`badge badge-${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* VERIFICATION */}

                      <td>{item.verification || "—"}</td>

                      {/* CHECK-IN */}

                      <td>
                        {item.checkInTime
                          ? new Date(item.checkInTime).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
