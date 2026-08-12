import {
  LayoutDashboard,
  Users,
  MapPin,
  ClipboardCheck,
  PhoneCall,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users,
    },
    {
      name: "Locations",
      path: "/locations",
      icon: MapPin,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "AI Calls",
      path: "/calls",
      icon: PhoneCall,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">AI</div>

        <div>
          <h2>AttendAI</h2>
          <span>HR Attendance</span>
        </div>
      </div>

      <nav className="nav">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />

              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="ai-status">
          <span className="status-dot" />

          <div>
            <strong>AI System</strong>

            <small>Operational</small>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
