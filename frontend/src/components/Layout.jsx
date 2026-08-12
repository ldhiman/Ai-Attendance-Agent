import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Attendance Management</h1>
            <p>AI-powered workforce attendance</p>
          </div>

          <div className="topbar-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
