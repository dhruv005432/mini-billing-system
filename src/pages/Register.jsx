import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBilling } from "../context";
import { api } from "../services/api";
import OtpModal from "../components/auth/OtpModal";
import SocialAuthModal from "../components/auth/SocialAuthModal";

function Register() {
  const navigate = useNavigate();
  const {
    currentUser,
    prepareRegisterUser,
    prepareSocialUser,
    sendCompulsoryOtp,
    completeAuthentication
  } = useBilling();

  // Form states
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
    gstNumber: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Social Auth Modal
  const [socialProvider, setSocialProvider] = useState(null);

  // Compulsory 2FA OTP Modal states
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [currentOtp, setCurrentOtp] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  // Resend OTP countdown
  useEffect(() => {
    let interval = null;
    if (isOtpOpen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpOpen, resendTimer]);

  // Strong password verification checks
  const checkPasswordCriteria = (pwd = "") => {
    return {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      symbol: /[@#$!%*?&^]/.test(pwd)
    };
  };

  const pwdCriteria = checkPasswordCriteria(formData.password);
  const pwdScore = Object.values(pwdCriteria).filter(Boolean).length;
  const isStrong = pwdScore === 5;

  // Trigger Compulsory Phone SMS & Mail OTP
  const triggerOtpVerification = async (user, providerLabel) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const mobile = user.mobile;
      const email = user.email;
      const businessName = user.businessName;

      const res = await sendCompulsoryOtp({
        mobile,
        email,
        businessName,
        provider: providerLabel
      });

      const otp = typeof res === "object" ? res.otp : String(res);
      const url = typeof res === "object" ? res.previewUrl : null;

      setCurrentOtp(otp);
      setPreviewUrl(url);
      setPendingAuth({ user, mobile, email, businessName, provider: providerLabel });
      setResendTimer(30);
      setIsOtpOpen(true);
      setSuccessMessage(`Compulsory Verification: 6-Digit OTP sent to +91-${mobile} and ${email}!`);
    } catch (err) {
      setErrorMessage(err.message || "Failed to send verification OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.businessName.trim()) {
      setErrorMessage("Business / Shop Name is compulsory.");
      return;
    }

    if (!formData.ownerName.trim()) {
      setErrorMessage("Owner / Contact Name is compulsory.");
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage("Phone Number is compulsory: Please provide a valid 10-digit mobile number.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("A valid Email Address is compulsory.");
      return;
    }

    if (!isStrong) {
      setErrorMessage(
        "Strong Password Required: Must have 8+ characters, Uppercase, Lowercase, Number & Symbol (@#$!%*?&^). Example: Abc@#!20006"
      );
      return;
    }

    const prep = prepareRegisterUser(formData);
    if (!prep.success) {
      setErrorMessage(prep.message);
      return;
    }

    await triggerOtpVerification(prep.user, "Account Registration");
  };

  // Confirm Social OAuth
  const handleSocialSubmit = async (profile) => {
    const provider = socialProvider;
    setSocialProvider(null);
    const prep = prepareSocialUser(provider, profile);
    await triggerOtpVerification(prep.user, `${provider} OAuth`);
  };

  // Verify entered OTP
  const handleVerifyOtp = async (enteredOtp) => {
    if (enteredOtp.trim() !== currentOtp.trim()) {
      setErrorMessage("Invalid OTP code entered. Please check your SMS or Email.");
      return;
    }

    setIsOtpOpen(false);

    // Persist new user in MongoDB backend
    try {
      await api.register({
        businessName: pendingAuth.user.businessName,
        ownerName: pendingAuth.user.ownerName,
        email: pendingAuth.user.email,
        password: pendingAuth.user.password,
        mobile: pendingAuth.user.mobile,
        address: pendingAuth.user.address,
        gstNumber: pendingAuth.user.gstNumber
      });
    } catch (err) {
      console.warn("Backend registration sync notice:", err.message);
    }

    completeAuthentication(pendingAuth.user);
    navigate("/", { replace: true });
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!pendingAuth) return;
    const res = await sendCompulsoryOtp({
      mobile: pendingAuth.mobile,
      email: pendingAuth.email,
      businessName: pendingAuth.businessName,
      provider: pendingAuth.provider
    });
    const otp = typeof res === "object" ? res.otp : String(res);
    const url = typeof res === "object" ? res.previewUrl : null;
    setCurrentOtp(otp);
    setPreviewUrl(url);
    setResendTimer(30);
    setSuccessMessage(`New 6-Digit OTP dispatched to +91-${pendingAuth.mobile} and ${pendingAuth.email}!`);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
      }}
    >
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "520px", width: "100%" }}>
        {/* Brand Header */}
        <div className="bg-primary text-white text-center p-4">
          <div
            className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2 shadow-sm"
            style={{ width: "54px", height: "54px", fontSize: "26px" }}
          >
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <h4 className="fw-bold mb-1">Create Business Account</h4>
          <p className="small mb-0 text-white-50">
            Join Mini Billing System • Compulsory Phone SMS & Real-Time Mail 2FA
          </p>
        </div>

        <div className="card-body p-4">
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

          {/* Social Sign-Up Options */}
          <div className="mb-4">
            <p className="text-center text-muted small fw-semibold mb-2">
              Sign up with Social Account
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-danger flex-fill d-flex align-items-center justify-content-center gap-1 py-2 btn-sm fw-semibold shadow-sm"
                onClick={() => setSocialProvider("Google")}
                title="Sign up with Google"
              >
                <i className="bi bi-google fs-6"></i>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-primary flex-fill d-flex align-items-center justify-content-center gap-1 py-2 btn-sm fw-semibold shadow-sm"
                onClick={() => setSocialProvider("Facebook")}
                title="Sign up with Facebook"
              >
                <i className="bi bi-facebook fs-6"></i>
                <span>Facebook</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-dark flex-fill d-flex align-items-center justify-content-center gap-1 py-2 btn-sm fw-semibold shadow-sm"
                onClick={() => setSocialProvider("GitHub")}
                title="Sign up with GitHub"
              >
                <i className="bi bi-github fs-6"></i>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="position-relative text-center my-3">
            <hr />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted">
              Or Register Business Details
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Business / Shop Name <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-shop text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ABC Traders"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold">
                  Owner / Contact Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-person text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ramesh Patel"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold">
                  Phone / Mobile (10-Digit) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted fw-semibold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="owner@abctraders.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Strong Password Input */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-semibold mb-1">
                  Strong Password (8+ Chars) <span className="text-danger">*</span>
                </label>
                <small className="text-primary fw-semibold" style={{ fontSize: "11px" }}>
                  e.g. <code>Abc@#!20006</code>
                </small>
              </div>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Abc@#!20006"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 bg-light p-2 rounded border">
                  <div className="progress mb-2" style={{ height: "4px" }}>
                    <div
                      className={`progress-bar ${
                        pwdScore <= 2 ? "bg-danger" : pwdScore <= 4 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${(pwdScore / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: "11px" }}>
                    <span className={pwdCriteria.length ? "text-success fw-bold" : ""}>
                      <i className={`bi ${pwdCriteria.length ? "bi-check-circle-fill text-success" : "bi-circle"} me-1`}></i>
                      8+ chars
                    </span>
                    <span className={pwdCriteria.upper ? "text-success fw-bold" : ""}>
                      <i className={`bi ${pwdCriteria.upper ? "bi-check-circle-fill text-success" : "bi-circle"} me-1`}></i>
                      Uppercase (A-Z)
                    </span>
                    <span className={pwdCriteria.lower ? "text-success fw-bold" : ""}>
                      <i className={`bi ${pwdCriteria.lower ? "bi-check-circle-fill text-success" : "bi-circle"} me-1`}></i>
                      Lowercase (a-z)
                    </span>
                    <span className={pwdCriteria.number ? "text-success fw-bold" : ""}>
                      <i className={`bi ${pwdCriteria.number ? "bi-check-circle-fill text-success" : "bi-circle"} me-1`}></i>
                      Digit (0-9)
                    </span>
                    <span className={pwdCriteria.symbol ? "text-success fw-bold" : ""}>
                      <i className={`bi ${pwdCriteria.symbol ? "bi-check-circle-fill text-success" : "bi-circle"} me-1`}></i>
                      Symbol (@#$!%*?&^)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold">City / Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Surat, Gujarat"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold">GSTIN (Optional)</label>
                <input
                  type="text"
                  maxLength={15}
                  className="form-control"
                  placeholder="24XXXXXXXXXX"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="alert alert-light border py-2 px-3 mb-3 small text-muted d-flex align-items-center gap-2">
              <i className="bi bi-shield-check text-primary fs-5 flex-shrink-0"></i>
              <div>
                <strong>Compulsory 2FA:</strong> An SMS OTP will be dispatched to your phone and real-time email upon registration.
              </div>
            </div>

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary py-2 fw-semibold fs-6 shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Sending Verification Code...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Register Business
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-muted small mt-3 mb-0">
              Already have an account?{" "}
              <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Social Auth Confirmation Modal */}
      <SocialAuthModal
        provider={socialProvider}
        onClose={() => setSocialProvider(null)}
        onSubmit={handleSocialSubmit}
      />

      {/* Compulsory 2FA OTP Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        pendingAuth={pendingAuth}
        currentOtp={currentOtp}
        previewUrl={previewUrl}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        resendTimer={resendTimer}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </div>
  );
}

export default Register;
