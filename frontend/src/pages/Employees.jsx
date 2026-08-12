import { Search, RefreshCw } from "lucide-react";

import { useEffect, useState } from "react";

import { getEmployees } from "../services/api";

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const data = await getEmployees({
        search,
        limit: 100,
      });

      setEmployees(data.employees || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      loadEmployees();
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Employees</h2>

          <p>Manage your workforce</p>
        </div>

        <button className="secondary-btn" onClick={loadEmployees}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>
                      <strong>{employee.name}</strong>

                      <small>{employee.employeeId}</small>
                    </td>

                    <td>{employee.department || "—"}</td>

                    <td>{employee.designation || "—"}</td>

                    <td>{employee.locationId?.name || "—"}</td>

                    <td>
                      <span
                        className={`badge ${
                          employee.active ? "badge-present" : "badge-absent"
                        }`}
                      >
                        {employee.active ? "ACTIVE" : "INACTIVE"}
                      </span>
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

export default Employees;
