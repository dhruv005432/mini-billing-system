import { NavLink } from "react-router-dom";
import { useBilling } from "../../context";

function Sidebar({ isOpen, onClose }) {
  const { settings, currentUser, logout } = useBilling();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: "bi-speedometer2" },
    { name: "Billing", path: "/billing", icon: "bi-receipt" },
    { name: "Products", path: "/products", icon: "bi-box-seam" },
    { name: "Customers", path: "/customers", icon: "bi-people" },
    { name: "Invoices", path: "/invoices", icon: "bi-file-earmark-text" },
    { name: "Payments", path: "/payments", icon: "bi-credit-card" },
    { name: "Reports", path: "/reports", icon: "bi-bar-chart" },
    { name: "Settings", path: "/settings", icon: "bi-gear" }
  ];

  const displayName = currentUser?.ownerName || settings.ownerName || "Admin";
  const displayBusiness = currentUser?.businessName || settings.businessName || "ABC Traders";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="text-truncate">
            <h5 className="mb-0 text-truncate">
              {displayBusiness}
            </h5>
            <small>Billing & Invoicing</small>
          </div>
          <button
            className="btn btn-sm btn-link text-white-50 d-md-none ms-auto"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="user-box d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 text-truncate">
              <div className="user-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-truncate">
                <strong className="text-truncate">
                  {displayName}
                </strong>
                <small className="text-truncate d-block">
                  {displayBusiness}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-link text-danger p-0 ms-2"
              title="Logout"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
