import { MapPin, RefreshCw, Plus, X } from "lucide-react";

import { useEffect, useState } from "react";

import { getLocations, createLocation } from "../services/api";

const Locations = () => {
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    locationId: "",
    name: "",
    city: "",
    state: "",
    phoneNumber: "",
    timezone: "Asia/Kolkata",
  });

  const loadLocations = async () => {
    try {
      setLoading(true);

      const data = await getLocations();

      setLocations(data.locations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      await createLocation(form);

      setShowModal(false);

      setForm({
        locationId: "",
        name: "",
        city: "",
        state: "",
        phoneNumber: "",
        timezone: "Asia/Kolkata",
      });

      await loadLocations();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Locations</h2>

          <p>Manage your 100 workplace locations</p>
        </div>

        <div className="heading-actions">
          <button className="secondary-btn" onClick={loadLocations}>
            <RefreshCw size={17} />
            Refresh
          </button>

          <button className="primary-btn" onClick={() => setShowModal(true)}>
            <Plus size={17} />
            Add Location
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">Loading locations...</div>
      ) : (
        <div className="location-grid">
          {locations.map((location) => (
            <div className="location-card" key={location._id}>
              <div className="location-icon">
                <MapPin size={20} />
              </div>

              <div className="location-info">
                <span>{location.locationId}</span>

                <h3>{location.name}</h3>

                <p>
                  {location.city}, {location.state}
                </p>
              </div>

              <div className="employee-count">
                <strong>{location.employeeCount || 0}</strong>

                <span>employees</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          ADD LOCATION MODAL
      ========================= */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Add Location</h3>

                <p>Add a new workplace</p>
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
                  <label>Location ID *</label>

                  <input
                    name="locationId"
                    value={form.locationId}
                    onChange={handleChange}
                    placeholder="LOC101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location Name *</label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Delhi Office"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City</label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Delhi"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Delhi"
                  />
                </div>

                <div className="form-group">
                  <label>Attendance Phone</label>

                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+911234567890"
                  />
                </div>

                <div className="form-group">
                  <label>Timezone</label>

                  <select
                    name="timezone"
                    value={form.timezone}
                    onChange={handleChange}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>

                    <option value="Asia/Dubai">Asia/Dubai</option>

                    <option value="Asia/Singapore">Asia/Singapore</option>

                    <option value="Europe/London">Europe/London</option>

                    <option value="America/New_York">America/New_York</option>
                  </select>
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
                  {saving ? "Creating..." : "Create Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
