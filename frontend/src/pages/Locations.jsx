import { MapPin, RefreshCw } from "lucide-react";

import { useEffect, useState } from "react";

import { getLocations } from "../services/api";

const Locations = () => {
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Locations</h2>

          <p>Workforce distribution across 100 locations</p>
        </div>

        <button className="secondary-btn" onClick={loadLocations}>
          <RefreshCw size={17} />
          Refresh
        </button>
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
    </div>
  );
};

export default Locations;
