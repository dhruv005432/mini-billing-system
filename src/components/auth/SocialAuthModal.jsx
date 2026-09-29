import { useState } from "react";

function getInitialProfile(provider) {
  if (provider === "Google") {
    return {
      name: "Dhruv Patel",
      email: "dhruv.google@gmail.com",
      mobile: "9876543210",
      businessName: "ABC Traders (Google Auth)"
    };
  }
  if (provider === "Facebook") {
    return {
      name: "Dhruv Kumar",
      email: "dhruv.facebook@example.com",
      mobile: "9988776655",
      businessName: "ABC Traders (Facebook)"
    };
  }
  if (provider === "GitHub") {
    return {
      name: "dhruvdhameliya",
      email: "developer.dhruv@github.com",
      mobile: "9811223344",
      businessName: "ABC Developers & Traders"
    };
  }
  return {
    name: "",
    email: "",
    mobile: "9876543210",
    businessName: ""
  };
}

function SocialAuthContent({ provider, onClose, onSubmit }) {
  const [profile, setProfile] = useState(() => getInitialProfile(provider));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanMobile = profile.mobile?.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      alert("A valid 10-digit mobile phone number is compulsory for SMS security verification.");
      return;
    }
    onSubmit(profile);
  };

  const getProviderConfig = () => {
    switch (provider) {
      case "Google":
        return { bg: "bg-danger", icon: "bi-google", text: "Google" };
      case "Facebook":
        return { bg: "bg-primary", icon: "bi-facebook", text: "Facebook" };
      case "GitHub":
        return { bg: "bg-dark", icon: "bi-github", text: "GitHub" };
      default:
        return { bg: "bg-secondary", icon: "bi-person-badge", text: provider };
    }
  };

  const config = getProviderConfig();

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header */}
          <div className={`p-3 text-white d-flex align-items-center justify-content-between ${config.bg}`}>
            <div className="d-flex align-items-center gap-2">
              <i className={`bi ${config.icon} fs-5`}></i>
              <h6 className="modal-title mb-0 fw-bold">Sign in with {config.text}</h6>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="alert alert-light border small text-muted mb-3 d-flex align-items-start gap-2">
                <i className="bi bi-shield-check text-primary fs-5 mt-1"></i>
                <div>
                  <strong>Compulsory Phone SMS & Email 2FA:</strong> Mini Billing System requires a verified mobile number to send your security OTP verification code.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Account / Owner Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-person text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  {config.text} Email Address <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Compulsory Mobile Number for SMS <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white fw-semibold text-muted">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    placeholder="9876543210 (10 digits)"
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold">Business / Shop Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-shop text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    placeholder="e.g. ABC Traders"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light p-3">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={`btn btn-sm ${config.bg} text-white fw-semibold shadow-sm`}>
                <i className="bi bi-shield-lock me-1"></i> Continue & Receive OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SocialAuthModal(props) {
  if (!props.provider) return null;
  return <SocialAuthContent key={props.provider} {...props} />;
}

export default SocialAuthModal;
