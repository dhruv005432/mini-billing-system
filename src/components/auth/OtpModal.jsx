import { useState } from "react";
import { openNativeSmsApp, openNativeMailApp } from "../../utils/deviceAlerts";

function OtpModalContent({
  onClose,
  pendingAuth,
  currentOtp,
  previewUrl,
  onVerify,
  onResend,
  resendTimer,
  errorMessage,
  successMessage
}) {
  const [enteredOtp, setEnteredOtp] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (enteredOtp.length === 6) {
      onVerify(enteredOtp);
    }
  };

  const handleCopyOtp = () => {
    if (!currentOtp) return;
    navigator.clipboard.writeText(currentOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGmail = pendingAuth?.email?.toLowerCase().includes("gmail.com");

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white p-3 text-center position-relative">
            <button
              type="button"
              className="btn-close btn-close-white position-absolute top-50 end-0 translate-middle-y me-3"
              onClick={onClose}
              aria-label="Close"
            ></button>
            <div
              className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2 shadow-sm"
              style={{ width: "48px", height: "48px", fontSize: "22px" }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h5 className="modal-title fw-bold mb-0">Two-Factor Authentication</h5>
            <small className="text-white-50">Compulsory Phone SMS & Real-Time Mail Verification</small>
          </div>

          <div className="modal-body p-4">
            <p className="text-center text-muted small mb-3">
              To keep your billing account safe, a 6-digit OTP code has been dispatched to your registered phone and email.
            </p>

            {errorMessage && (
              <div className="alert alert-danger py-2 small d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-6 flex-shrink-0"></i>
                <div>{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success py-2 small d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-6 flex-shrink-0"></i>
                <div>{successMessage}</div>
              </div>
            )}

            {/* Recipient Channels */}
            <div className="bg-light p-3 rounded-3 mb-3 border">
              {/* Phone SMS Channel */}
              <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "34px", height: "34px", fontSize: "14px" }}
                  >
                    <i className="bi bi-chat-text-fill"></i>
                  </div>
                  <div>
                    <span className="d-block small fw-bold">SMS Sent To</span>
                    <small className="text-muted">+91-{pendingAuth.mobile}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold"
                  onClick={() =>
                    openNativeSmsApp(
                      pendingAuth.mobile,
                      `Your Mini Billing OTP code is: ${currentOtp}`
                    )
                  }
                  title="Open phone SMS app"
                >
                  <i className="bi bi-phone me-1"></i> Open SMS
                </button>
              </div>

              {/* Email Channel */}
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "34px", height: "34px", fontSize: "14px" }}
                  >
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div>
                    <span className="d-block small fw-bold">Email Sent To</span>
                    <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: "160px" }}>
                      {pendingAuth.email}
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-1">
                  {previewUrl ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-info text-white py-1 px-2 fw-semibold"
                      title="Open real delivered email"
                    >
                      <i className="bi bi-envelope-open me-1"></i> View Email
                    </a>
                  ) : isGmail ? (
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-danger py-1 px-2 fw-semibold"
                      title="Open Gmail Inbox"
                    >
                      <i className="bi bi-google me-1"></i> Gmail
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-1 px-2 fw-semibold"
                      onClick={() =>
                        openNativeMailApp(
                          pendingAuth.email,
                          "Mini Billing Verification OTP",
                          `Your security OTP verification code is: ${currentOtp}`
                        )
                      }
                      title="Open phone Mail client"
                    >
                      <i className="bi bi-envelope-open me-1"></i> Open Mail
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-center">
                <label className="form-label small fw-semibold text-muted mb-2">
                  ENTER 6-DIGIT VERIFICATION CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-control form-control-lg text-center fw-bold fs-3 text-primary shadow-sm"
                  style={{ letterSpacing: "8px" }}
                  placeholder="------"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  required
                />
              </div>

              {/* Quick Actions (Auto-Fill & Copy OTP) */}
              {currentOtp && (
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning py-1 px-3 fw-semibold text-dark shadow-sm"
                    onClick={() => setEnteredOtp(currentOtp)}
                  >
                    <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                    Auto-Fill Code ({currentOtp})
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary py-1 px-2"
                    onClick={handleCopyOtp}
                    title="Copy OTP to clipboard"
                  >
                    <i className={`bi ${copied ? "bi-check-lg text-success" : "bi-clipboard"} me-1`}></i>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-primary py-2 fw-semibold fs-6 shadow-sm"
                  disabled={enteredOtp.length < 6}
                >
                  <i className="bi bi-check-circle me-1"></i> Verify & Access Dashboard
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center text-muted small">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-secondary p-0 text-decoration-none"
                  onClick={onClose}
                >
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>

                {resendTimer > 0 ? (
                  <span>
                    Resend code in <strong>{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-primary p-0 fw-semibold text-decoration-none"
                    onClick={onResend}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Resend OTP Code
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function OtpModal(props) {
  if (!props.isOpen || !props.pendingAuth) return null;
  return <OtpModalContent key={`${props.pendingAuth?.mobile}_${props.currentOtp}`} {...props} />;
}

export default OtpModal;
