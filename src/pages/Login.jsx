import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBilling } from "../context";
import OtpModal from "../components/auth/OtpModal";
import SocialAuthModal from "../components/auth/SocialAuthModal";

function Login() {
  const navigate = useNavigate();
  const {
    currentUser,
    findUserForLogin,
    prepareSocialUser,
    sendCompulsoryOtp,
    completeAuthentication
  } = useBilling();

  // Form states
  const [identifier, setIdentifier] = useState("admin@abctraders.com");
  const [password, setPassword] = useState("Abc@#!20006");
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

  // Strong password checker (Min 8 chars, Uppercase, Lowercase, Number, Symbol)
  const isStrongPassword = (pwd = "") => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[@#$!%*?&^]/.test(pwd)
    );
  };

  // Trigger Compulsory Phone SMS & Mail OTP
  const triggerOtpVerification = async (user, providerLabel) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const mobile = user.mobile || "9876543210";
      const email = user.email;
      const businessName = user.businessName || "ABC Traders";

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

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setErrorMessage("Please enter your registered mobile number or email.");
      return;
    }

    if (!isStrongPassword(password)) {
      setErrorMessage(
        "Strong Password Required: At least 8 characters with Uppercase, Lowercase, Number & Symbol (e.g. Abc@#!20006)."
      );
      return;
    }

    const check = findUserForLogin(identifier, password);
    if (!check.success) {
      setErrorMessage(check.message);
      return;
    }

    await triggerOtpVerification(check.user, "Mobile/Email Login");
  };

  // Confirm Social OAuth
  const handleSocialSubmit = async (profile) => {
    const provider = socialProvider;
    setSocialProvider(null);
    const prep = prepareSocialUser(provider, profile);
    await triggerOtpVerification(prep.user, `${provider} OAuth`);
  };

  // Verify entered OTP
  const handleVerifyOtp = (enteredOtp) => {
    if (enteredOtp.trim() !== currentOtp.trim()) {
      setErrorMessage("Invalid OTP code entered. Please check your SMS or Email.");
      return;
    }

    // OTP Verified! Log user in
    setIsOtpOpen(false);
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
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "460px", width: "100%" }}>
        {/* Brand Header */}
        <div className="bg-primary text-white text-center p-4">
          <div
            className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2 shadow-sm"
            style={{ width: "54px", height: "54px", fontSize: "26px" }}
          >
            <i className="bi bi-shield-check"></i>
          </div>
          <h4 className="fw-bold mb-1">Mini Billing System</h4>
          <p className="small mb-0 text-white-50">
            Sign In with Compulsory Phone SMS & Real-Time Mail 2FA
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

          {/* Social Sign-In Buttons */}
          <div className="mb-4">
            <p className="text-center text-muted small fw-semibold mb-2">
              Sign in with Social (Phone SMS & Mail Verified)
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-danger flex-fill d-flex align-items-center justify-content-center gap-1 py-2 btn-sm fw-semibold shadow-sm"
                onClick={() => setSocialProvider("Google")}
                title="Sign in with Google"
              >
                <i className="bi bi-google fs-6"></i>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-primary flex-fill d-flex align-items-center justify-content-center gap-1 py-2 btn-sm fw-semibold shadow-sm"
                onClick={() => setSocialProvider("Facebook")}
                title="Sign in with Facebook"
              >
                <i className="bi bi-facebook fs-6"></i>
                <span>Facebook</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-dark flex-fill d-flex align-items-center justify-content-center gap-1 py-2 btn-sm fw-semibold shadow-sm"
                onClick={() => setSocialProvider("GitHub")}
                title="Sign in with GitHub"
              >
                <i className="bi bi-github fs-6"></i>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="position-relative text-center my-3">
            <hr />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted">
              Or with Mobile / Email & Strong Password
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Registered Mobile Number or Email <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-person text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 9876543210 or admin@abctraders.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-semibold mb-1">
                  Strong Password <span className="text-danger">*</span>
                </label>
                <small className="text-primary fw-semibold" style={{ fontSize: "11px" }}>
                  e.g. Abc@#!20006
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="alert alert-light border py-2 px-3 mb-3 small text-muted d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-primary fs-5 flex-shrink-0"></i>
              <div>
                <strong>Compulsory 2FA:</strong> 6-Digit security OTP will be dispatched to Phone SMS & Real-Time Email.
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
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-muted small mt-3 mb-0">
              Don't have an account?{" "}
              <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                Register your business here
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

export default Login;
