import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBilling } from "../../context";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { settings, currentUser, logout, resetToDemoData, notifications, clearNotifications } = useBilling();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data to demo records? Any unsaved changes will be replaced.")) {
      resetToDemoData();
      alert("System data reset to initial demo state.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const displayName = currentUser?.ownerName || settings.ownerName || "Admin";
  const displayBusiness = currentUser?.businessName || settings.businessName || "ABC Traders";

  return (
    <header className="top-navbar position-relative">
      <div className="d-flex align-items-center">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list"></i>
        </button>

        <span className="navbar-title text-truncate" style={{ maxWidth: "280px" }}>
          {displayBusiness}
        </span>
      </div>

      <div className="navbar-actions">
        <Link to="/billing" className="btn btn-sm btn-primary d-none d-sm-inline-flex align-items-center">
          <i className="bi bi-plus-lg me-1"></i>
          New Bill
        </Link>

        <button
          className="navbar-icon"
          title="Reset to Demo Data"
          onClick={handleResetData}
          aria-label="Reset demo data"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>

        {/* Notifications Button with Badge */}
        <div className="position-relative">
          <button
            className="navbar-icon position-relative"
            title="Notifications & Alerts"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Toggle notifications"
          >
            <i className="bi bi-bell"></i>
            {notifications && notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              className="card shadow-lg border-0 position-absolute end-0 mt-2 rounded-3 overflow-hidden"
              style={{ width: "340px", zIndex: 1050 }}
            >
              <div className="card-header bg-white py-2 px-3 d-flex justify-content-between align-items-center border-bottom">
                <strong className="small text-dark">
                  <i className="bi bi-bell-fill text-primary me-1"></i>
                  Alerts & Security ({notifications?.length || 0})
                </strong>
                {notifications && notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-muted"
                    style={{ fontSize: "11px" }}
                    onClick={clearNotifications}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="card-body p-0" style={{ maxHeight: "320px", overflowY: "auto" }}>
                {notifications && notifications.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {notifications.map((notif) => {
                      const isEmail = notif.type === "email";
                      const isSms = notif.type === "sms";
                      return (
                        <div key={notif.id} className="list-group-item px-3 py-2">
                          <div className="d-flex align-items-start gap-2">
                            <span
                              className={`badge rounded-pill p-2 ${
                                isEmail
                                  ? "bg-primary-subtle text-primary"
                                  : isSms
                                  ? "bg-success-subtle text-success"
                                  : "bg-warning-subtle text-warning-emphasis"
                              }`}
                            >
                              <i
                                className={`bi ${
                                  isEmail
                                    ? "bi-envelope-check"
                                    : isSms
                                    ? "bi-chat-dots"
                                    : "bi-shield-check"
                                }`}
                              ></i>
                            </span>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <strong className="small text-dark" style={{ fontSize: "12px" }}>
                                  {notif.title}
                                </strong>
                                <small className="text-muted" style={{ fontSize: "10px" }}>
                                  {notif.time || ""}
                                </small>
                              </div>
                              <p className="mb-0 text-muted small" style={{ fontSize: "11px" }}>
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted small">
                    <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>
                    No alerts or notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-user">
          <div className="navbar-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="navbar-user-info">
            <strong>{displayName}</strong>
            <small className="text-truncate" style={{ maxWidth: "120px" }}>
              {displayBusiness}
            </small>
          </div>
        </div>

        <button
          className="btn btn-sm btn-outline-danger ms-2 d-flex align-items-center"
          title="Logout"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-1"></i>
          <span className="d-none d-md-inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
