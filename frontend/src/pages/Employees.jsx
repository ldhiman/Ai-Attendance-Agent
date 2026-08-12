import { Search, RefreshCw, Plus, X } from "lucide-react";

import { useEffect, useState } from "react";

import { getEmployees, getLocations, createEmployee } from "../services/api";

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const [locations, setLocations] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    phone: "",
    email: "",
    department: "",
    designation: "",
    locationId: "",
    shiftStart: "09:00",
    shiftEnd: "18:00",
  });

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

  const loadLocations = async () => {
    try {
      const data = await getLocations();

      setLocations(data.locations || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadLocations();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createEmployee(form);

      setShowModal(false);

      setForm({
        employeeId: "",
        name: "",
        phone: "",
        email: "",
        department: "",
        designation: "",
        locationId: "",
        shiftStart: "09:00",
        shiftEnd: "18:00",
      });

      await loadEmployees();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Employees</h2>

          <p>Manage your workforce</p>
        </div>

        <div className="heading-actions">
          <button className="secondary-btn" onClick={loadEmployees}>
            <RefreshCw size={17} />
            Refresh
          </button>

          <button className="primary-btn" onClick={() => setShowModal(true)}>
            <Plus size={17} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadEmployees();
              }
            }}
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

      {/* =========================
          ADD EMPLOYEE MODAL
      ========================= */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Add Employee</h3>

                <p>Add a new employee</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID *</label>

                  <input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="EMP1001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Full Name *</label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+919876543210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>

                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Location *</label>

                  <select
                    name="locationId"
                    value={form.locationId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select location</option>

                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.locationId} — {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Shift Start</label>

                  <input
                    type="time"
                    name="shiftStart"
                    value={form.shiftStart}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Shift End</label>

                  <input
                    type="time"
                    name="shiftEnd"
                    value={form.shiftEnd}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Creating..." : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
