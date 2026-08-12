import { PhoneCall, RefreshCw } from "lucide-react";

import { useEffect, useState } from "react";

import { getCalls } from "../services/api";

const Calls = () => {
  const [calls, setCalls] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadCalls = async () => {
    try {
      setLoading(true);

      const data = await getCalls({
        limit: 100,
      });

      setCalls(data.calls || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>AI Calls</h2>

          <p>Hunar attendance verification calls</p>
        </div>

        <button className="secondary-btn" onClick={loadCalls}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loading">Loading calls...</div>
        ) : calls.length === 0 ? (
          <div className="empty-state">
            <PhoneCall size={35} />

            <h3>No calls yet</h3>

            <p>AI attendance calls will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Call ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Started</th>
                </tr>
              </thead>

              <tbody>
                {calls.map((call) => (
                  <tr key={call._id}>
                    <td>
                      <strong>{call.employeeId?.name}</strong>

                      <small>{call.employeeId?.employeeId}</small>
                    </td>

                    <td>
                      <code>{call.hunarCallId}</code>
                    </td>

                    <td>{call.type}</td>

                    <td>
                      <span className="badge badge-pending">{call.status}</span>
                    </td>

                    <td>
                      {call.startedAt
                        ? new Date(call.startedAt).toLocaleTimeString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calls;
