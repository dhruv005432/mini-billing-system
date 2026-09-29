// Device alert utilities: Web Audio chime, mobile vibration, native SMS & Mail hooks

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.12); // A5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(587.33, now);
    osc2.frequency.setValueAtTime(880, now + 0.12);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn("Audio notification not supported or blocked:", e);
  }
};

export const vibratePhone = (pattern = [200, 100, 200]) => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    console.warn("Vibration not supported:", e);
  }
};

export const openNativeSmsApp = (mobile, message) => {
  const cleanMobile = (mobile || "").replace(/\D/g, "");
  const encodedBody = encodeURIComponent(message || "Mini Billing verification code");

  // Works on both iOS and Android
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? "&" : "?";
  const smsUrl = `sms:${cleanMobile}${separator}body=${encodedBody}`;

  window.open(smsUrl, "_blank");
};

export const openNativeMailApp = (email, subject, body) => {
  const mailUrl = `mailto:${email}?subject=${encodeURIComponent(
    subject || "Security Verification"
  )}&body=${encodeURIComponent(body || "")}`;

  window.open(mailUrl, "_blank");
};
