import { useBilling } from "../../context";

function NotificationToast() {
  const { activeToasts, dismissToast } = useBilling();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1090, maxWidth: "400px", width: "100%", pointerEvents: "none" }}
    >
      <div className="d-flex flex-column gap-2" style={{ pointerEvents: "auto" }}>
        {activeToasts.map((toast) => {
          const isEmail = toast.type === "email";
          const isSms = toast.type === "sms";

          const badgeBg = isEmail
            ? "bg-primary text-white"
            : isSms
            ? "bg-success text-white"
            : "bg-warning text-dark";

          const icon = isEmail
            ? "bi-envelope-check-fill"
            : isSms
            ? "bi-chat-dots-fill"
            : "bi-shield-check";

          return (
            <div
              key={toast.id}
              className="toast show shadow-lg border-0 rounded-3 bg-white overflow-hidden animate-slide-in"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className={`toast-header ${badgeBg} border-0 py-2 px-3`}>
                <i className={`bi ${icon} me-2 fs-6`}></i>
                <strong className="me-auto small text-truncate">
                  {toast.title}
                </strong>
                <small className="opacity-75 ms-2">{toast.time || "Just now"}</small>
                <button
                  type="button"
                  className="btn-close btn-close-white ms-2"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="toast-body py-2 px-3 text-secondary small bg-light">
                {toast.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationToast;
