import {
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  RefreshCw,
  CalendarPlus,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getDashboardSummary,
  getAttendance,
  generateAttendance,
} from "../services/api";

import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  const [recentAttendance, setRecentAttendance] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [generateMessage, setGenerateMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const handleGenerateAttendance = async () => {
    try {
      setGenerating(true);
      setGenerateMessage("");

      const result = await generateAttendance();

      setGenerateMessage(
        `${result.created} attendance records created. ${result.existing} already existed.`,
      );

      await loadDashboard();
    } catch (error) {
      console.error("Generate attendance error:", error);

      setGenerateMessage(
        error.response?.data?.message || "Failed to generate attendance.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [summaryData, attendanceData] = await Promise.all([
        getDashboardSummary(),
        getAttendance({
          limit: 8,
        }),
      ]);

      setSummary(summaryData);

      setRecentAttendance(attendanceData.attendance || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="loading-page">Loading dashboard...</div>;
  }

  const data = summary?.summary || {};

  const total = summary?.totalEmployees || 0;

  const present = data.PRESENT || 0;

  const late = data.LATE || 0;

  const absent = data.ABSENT || 0;

  const pending = data.PENDING || 0;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Today's Overview</h2>

          <p>Real-time attendance across all locations</p>
        </div>

        <div className="heading-actions">
          <button
            className="secondary-btn"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="primary-btn"
            onClick={handleGenerateAttendance}
            disabled={generating}
          >
            <CalendarPlus size={17} />

            {generating ? "Generating..." : "Generate Today's Attendance"}
          </button>
        </div>
      </div>

      {generateMessage && (
        <div className="action-message">{generateMessage}</div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={total}
          subtitle="Active employees"
          icon={Users}
        />

        <StatCard
          title="Present"
          value={present}
          subtitle={`${
            total ? Math.round((present / total) * 100) : 0
          }% of workforce`}
          icon={CheckCircle2}
        />

        <StatCard
          title="Late"
          value={late}
          subtitle="Checked in late"
          icon={Clock3}
        />

        <StatCard
          title="Absent"
          value={absent}
          subtitle="Not attending"
          icon={XCircle}
        />

        <StatCard
          title="Pending"
          value={pending}
          subtitle="Awaiting verification"
          icon={AlertTriangle}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Attendance</h3>

              <p>Latest employee attendance activity</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Check-in</th>
                </tr>
              </thead>

              <tbody>
                {recentAttendance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.employeeId?.name}</strong>

                      <small>{item.employeeId?.employeeId}</small>
                    </td>

                    <td>{item.locationId?.name}</td>

                    <td>
                      <span
                        className={`badge badge-${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>

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
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Attendance Progress</h3>

              <p>Today's workforce</p>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-value">
              {total ? Math.round(((present + late) / total) * 100) : 0}%
            </div>

            <div className="progress-label">Verified attendance</div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${total ? ((present + late) / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
