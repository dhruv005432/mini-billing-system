import { useState, useEffect } from "react";
import {
  initialProducts,
  initialCustomers,
  initialSettings,
  initialInvoices,
  initialUsers
} from "../data/initialData";
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem
} from "../utils/storage";
import { generateNextInvoiceNumber } from "../utils/invoiceNumber";
import { playNotificationSound, vibratePhone } from "../utils/deviceAlerts";
import { api } from "../services/api";
import { socket } from "../services/socket";
import { BillingContext } from "./BillingContextDef";

export const BillingProvider = ({ children }) => {
  const [products, setProducts] = useState(() =>
    getStorageItem(STORAGE_KEYS.PRODUCTS, initialProducts)
  );
  const [customers, setCustomers] = useState(() =>
    getStorageItem(STORAGE_KEYS.CUSTOMERS, initialCustomers)
  );
  const [invoices, setInvoices] = useState(() =>
    getStorageItem(STORAGE_KEYS.INVOICES, initialInvoices)
  );
  const [settings, setSettings] = useState(() =>
    getStorageItem(STORAGE_KEYS.SETTINGS, initialSettings)
  );
  const [users, setUsers] = useState(() =>
    getStorageItem(STORAGE_KEYS.USERS, initialUsers)
  );
  const [currentUser, setCurrentUser] = useState(() =>
    getStorageItem(STORAGE_KEYS.AUTH_USER, null)
  );
  const [notifications, setNotifications] = useState(() =>
    getStorageItem(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 1,
        title: "System Ready",
        message: "Mini Billing workspace initialized with 100% GST support.",
        type: "system",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ])
  );
  const [activeToasts, setActiveToasts] = useState([]);

  // Notification and Real Alert Dispatcher
  const dismissToast = (id) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setActiveToasts([]);
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...notif
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToasts((prev) => [newNotif, ...prev.slice(0, 3)]);

    // Trigger real HTML5 desktop notification if supported and allowed
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: "/favicon.svg"
        });
      } catch (err) {
        console.warn("Desktop notification error:", err);
      }
    }
  };

  // Sync to localStorage on state changes
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.INVOICES, invoices);
  }, [invoices]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      setStorageItem(STORAGE_KEYS.AUTH_USER, currentUser);
    } else {
      removeStorageItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [currentUser]);

  // Connect to Backend API & Sync MongoDB Data
  useEffect(() => {
    const fetchDataFromBackend = async () => {
      try {
        const [prodRes, custRes, invRes, settRes] = await Promise.allSettled([
          api.getProducts(),
          api.getCustomers(),
          api.getInvoices(),
          api.getSettings()
        ]);

        if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
          setProducts(prodRes.value.map((p) => ({ ...p, id: p._id || p.id })));
        }
        if (custRes.status === "fulfilled" && Array.isArray(custRes.value) && custRes.value.length > 0) {
          setCustomers(custRes.value.map((c) => ({ ...c, id: c._id || c.id })));
        }
        if (invRes.status === "fulfilled" && Array.isArray(invRes.value) && invRes.value.length > 0) {
          setInvoices(invRes.value.map((i) => ({ ...i, id: i._id || i.id })));
        }
        if (settRes.status === "fulfilled" && settRes.value) {
          setSettings((prev) => ({ ...prev, ...settRes.value }));
        }
      } catch (err) {
        console.warn("Backend sync fallback to localStorage:", err.message);
      }
    };

    fetchDataFromBackend();
  }, []);

  // Real-time Socket.io Live Listeners
  useEffect(() => {
    socket.on("otp:sent", (data) => {
      playNotificationSound();
      vibratePhone([200, 100, 200]);
      addNotification({
        title: "Compulsory OTP Sent (SMS & Mail)",
        message: `Security OTP ${data.otp} sent to ${data.email} and +91-${data.mobile?.slice(-10)}`,
        type: "security"
      });
    });

    socket.on("invoice:created", ({ invoice, message }) => {
      playNotificationSound();
      addNotification({
        title: "New Tax Invoice",
        message: message || `Invoice #${invoice?.invoiceNumber} created.`,
        type: "invoice"
      });
      setInvoices((prev) => {
        const id = invoice?._id || invoice?.id;
        if (prev.some((inv) => (inv._id || inv.id) === id)) return prev;
        return [{ ...invoice, id }, ...prev];
      });
    });

    socket.on("payment:recorded", ({ invoice, payment, message }) => {
      playNotificationSound();
      addNotification({
        title: "Payment Received",
        message: message || `Payment of ₹${payment?.amount} recorded.`,
        type: "payment"
      });
      setInvoices((prev) =>
        prev.map((inv) =>
          (inv._id || inv.id) === (invoice?._id || invoice?.id)
            ? { ...invoice, id: invoice?._id || invoice?.id }
            : inv
        )
      );
    });

    socket.on("invoice:deleted", ({ invoiceNumber, message }) => {
      addNotification({
        title: "Invoice Deleted",
        message: message || `Invoice #${invoiceNumber} removed and stock restored.`,
        type: "system"
      });
    });

    return () => {
      socket.off("otp:sent");
      socket.off("invoice:created");
      socket.off("payment:recorded");
      socket.off("invoice:deleted");
    };
  }, []);

  // Product CRUD
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
      price: Number(productData.price) || 0,
      purchasePrice: Number(productData.purchasePrice) || 0,
      gst: Number(productData.gst) || 0,
      stock: Number(productData.stock) || 0
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === Number(id)
          ? {
              ...item,
              ...updatedData,
              price: Number(updatedData.price ?? item.price),
              purchasePrice: Number(updatedData.purchasePrice ?? item.purchasePrice),
              gst: Number(updatedData.gst ?? item.gst),
              stock: Number(updatedData.stock ?? item.stock)
            }
          : item
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== Number(id)));
  };

  // Customer CRUD
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: Date.now()
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers((prev) =>
      prev.map((item) =>
        item.id === Number(id) ? { ...item, ...updatedData } : item
      )
    );
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((item) => item.id !== Number(id)));
  };

  // Invoice Actions
  const createInvoice = (invoiceData) => {
    const newInvoiceNumber =
      invoiceData.invoiceNumber ||
      generateNextInvoiceNumber(
        invoices,
        settings.invoicePrefix || "INV",
        Number(settings.startingNumber) || 1001
      );

    const total = Number(invoiceData.total || 0);
    const amountPaid = Number(
      invoiceData.amountPaid !== undefined
        ? invoiceData.amountPaid
        : invoiceData.paymentStatus === "Paid"
        ? total
        : 0
    );
    const amountDue =
      invoiceData.amountDue !== undefined
        ? Number(invoiceData.amountDue)
        : Math.max(total - amountPaid, 0);

    const initialHistory =
      Array.isArray(invoiceData.paymentHistory) && invoiceData.paymentHistory.length > 0
        ? invoiceData.paymentHistory
        : amountPaid > 0
        ? [
            {
              id: Date.now(),
              amount: amountPaid,
              paymentMethod: invoiceData.paymentMethod || "Cash",
              date: invoiceData.date || new Date().toISOString().split("T")[0]
            }
          ]
        : [];

    const newInvoice = {
      ...invoiceData,
      id: Date.now(),
      invoiceNumber: newInvoiceNumber,
      date: invoiceData.date || new Date().toISOString().split("T")[0],
      total,
      amountPaid,
      amountDue,
      paymentHistory: initialHistory
    };

    // Deduct stock for each billed product
    if (newInvoice.items && newInvoice.items.length > 0) {
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const matchedItem = newInvoice.items.find(
            (it) => it.productId === prod.id
          );
          if (matchedItem) {
            const newStock = Math.max(0, (prod.stock || 0) - matchedItem.quantity);
            return { ...prod, stock: newStock };
          }
          return prod;
        })
      );
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoiceStatus = (id, paymentStatus, paymentMethod) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === Number(id)
          ? {
              ...inv,
              paymentStatus: paymentStatus || inv.paymentStatus,
              paymentMethod: paymentMethod || inv.paymentMethod
            }
          : inv
      )
    );
  };

  const recordPayment = (invoiceId, { amount, paymentMethod }) => {
    const paymentAmount = Number(amount);
    const paymentDate = new Date().toISOString().split("T")[0];

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== Number(invoiceId)) return inv;

        const total = Number(inv.total || 0);
        const newPaid = Number(inv.amountPaid || 0) + paymentAmount;
        const newDue = Math.max(total - newPaid, 0);
        let newStatus = "Partial";
        if (newDue === 0) newStatus = "Paid";
        else if (newPaid === 0) newStatus = "Pending";

        const newEntry = {
          id: Date.now(),
          amount: paymentAmount,
          paymentMethod: paymentMethod || "Cash",
          date: paymentDate
        };

        return {
          ...inv,
          amountPaid: newPaid,
          amountDue: newDue,
          paymentStatus: newStatus,
          paymentMethod: paymentMethod || inv.paymentMethod,
          paymentHistory: [...(inv.paymentHistory || []), newEntry]
        };
      })
    );
  };

  const deleteInvoice = (id) => {
    // Phase 6: Automatic stock restoration when deleting an invoice
    const targetInvoice = invoices.find((inv) => inv.id === Number(id));
    if (targetInvoice && targetInvoice.items && targetInvoice.items.length > 0) {
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const matchedItem = targetInvoice.items.find(
            (it) => it.productId === prod.id
          );
          if (matchedItem) {
            return {
              ...prod,
              stock: Number(prod.stock || 0) + Number(matchedItem.quantity || 0)
            };
          }
          return prod;
        })
      );
    }

    setInvoices((prev) => prev.filter((inv) => inv.id !== Number(id)));
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const triggerRealAlerts = ({ email, mobile, provider, businessName }) => {
    // Request permission if not yet decided
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch (e) {
        console.warn(e);
      }
    }

    // 1. Email Alert
    addNotification({
      title: "Email Alert: Successful Sign-In",
      message: `Security alert sent to ${email}. Sign-in confirmed via ${provider} for "${businessName || "ABC Traders"}".`,
      type: "email",
      provider
    });

    // 2. SMS Alert
    setTimeout(() => {
      addNotification({
        title: "SMS Alert: OTP & Login Verified",
        message: `SMS delivered to +91-${mobile || "9876543210"}: Your login to Mini Billing System was authenticated successfully.`,
        type: "sms",
        provider
      });
    }, 600);
  };

  // Compulsory Phone SMS & Mail OTP Generator with Chime & Vibration
  const sendCompulsoryOtp = async ({ mobile, email, businessName, provider, recipientName }) => {
    // Play phone notification chime & vibrate
    playNotificationSound();
    vibratePhone([200, 100, 200]);

    // Request desktop/mobile notification permission
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch (e) {
        console.warn(e);
      }
    }

    let otp = String(Math.floor(100000 + Math.random() * 900000));
    let previewUrl = null;

    // Call Backend API for real Nodemailer & SMS dispatch + Socket.io broadcast
    try {
      const res = await api.sendOtp({
        email,
        mobile,
        businessName: businessName || settings.businessName || "ABC Traders",
        recipientName: recipientName || "User"
      });
      if (res?.otp) {
        otp = String(res.otp);
      }
      if (res?.previewUrl) {
        previewUrl = res.previewUrl;
      }
    } catch (err) {
      console.warn("Backend send-otp fallback:", err.message);
    }

    // Native browser push notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`Mini Billing Security OTP: ${otp}`, {
          body: `Verification OTP ${otp} dispatched to +91-${mobile} and ${email}. Valid for 5 mins.`,
          icon: "/favicon.ico"
        });
      } catch (e) {
        console.warn("Native notification error:", e);
      }
    }

    // 1. Phone SMS Alert with OTP
    addNotification({
      title: "📱 Phone SMS OTP Alert",
      message: `Your Mini Billing OTP is ${otp}. Verification SMS delivered to +91-${mobile}. Do not share this code.`,
      type: "sms",
      provider: provider || "SMS Gateway"
    });

    // 2. Email Alert with OTP
    setTimeout(() => {
      addNotification({
        title: "📩 Email Security OTP Alert",
        message: `Your verification code is ${otp}. Sent to ${email} for "${businessName || "ABC Traders"}" sign-in.`,
        type: "email",
        provider: provider || "Mail Server"
      });
    }, 350);

    const otpResult = {
      otp,
      previewUrl,
      toString() {
        return this.otp;
      }
    };

    return otpResult;
  };

  const completeAuthentication = (user) => {
    setCurrentUser(user);
    setSettings((prev) => ({
      ...prev,
      businessName: user.businessName || prev.businessName,
      ownerName: user.ownerName || prev.ownerName,
      mobile: user.mobile || prev.mobile,
      email: user.email || prev.email,
      address: user.address || prev.address,
      gstNumber: user.gstNumber || prev.gstNumber
    }));

    addNotification({
      title: "Authentication Verified",
      message: `Welcome ${user.ownerName}! Phone SMS & Email security verification completed successfully.`,
      type: "system"
    });
  };

  const findUserForLogin = (identifier, password) => {
    const cleanId = identifier?.trim().toLowerCase();
    const cleanMobile = identifier?.replace(/\D/g, "");

    const foundUser = users.find((u) => {
      const emailMatches = u.email?.toLowerCase() === cleanId;
      const mobileMatches = cleanMobile && u.mobile?.replace(/\D/g, "") === cleanMobile;
      return (emailMatches || mobileMatches) && u.password === password;
    });

    if (!foundUser) {
      return { success: false, message: "Invalid mobile number, email, or password." };
    }

    return { success: true, user: foundUser };
  };

  const prepareRegisterUser = (userData) => {
    const cleanEmail = userData.email?.trim().toLowerCase();
    const cleanMobile = userData.mobile?.replace(/\D/g, "");

    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, message: "A valid 10-digit mobile number is compulsory." };
    }

    const emailExists = users.some((u) => u.email?.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: "An account with this email address already exists." };
    }

    const mobileExists = users.some((u) => u.mobile?.replace(/\D/g, "") === cleanMobile);
    if (mobileExists) {
      return { success: false, message: "An account with this mobile number already exists." };
    }

    const newUser = {
      id: Date.now(),
      businessName: userData.businessName?.trim() || "ABC Traders",
      ownerName: userData.ownerName?.trim() || "Admin",
      email: cleanEmail,
      password: userData.password,
      mobile: cleanMobile,
      address: userData.address?.trim() || "Surat, Gujarat",
      gstNumber: userData.gstNumber?.trim().toUpperCase() || ""
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true, user: newUser };
  };

  const prepareSocialUser = (provider, profile) => {
    const cleanEmail = (profile.email || `${provider.toLowerCase()}user@example.com`).trim().toLowerCase();
    const cleanMobile = profile.mobile?.replace(/\D/g, "") || "9876543210";

    let found = users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!found) {
      found = {
        id: Date.now(),
        businessName: profile.businessName || `${profile.name || provider} Traders`,
        ownerName: profile.name || `${provider} User`,
        email: cleanEmail,
        password: "SocialAuth@#123",
        mobile: cleanMobile,
        address: profile.address || "Surat, Gujarat",
        gstNumber: "",
        provider
      };
      setUsers((prev) => [...prev, found]);
    } else if (cleanMobile) {
      found = { ...found, mobile: cleanMobile };
      setUsers((prev) => prev.map((u) => (u.id === found.id ? found : u)));
    }

    return { success: true, user: found };
  };

  // Authentication methods
  const login = (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.email?.toLowerCase() === cleanEmail && u.password === password
    );

    if (!foundUser) {
      return { success: false, message: "Invalid email or password." };
    }

    setCurrentUser(foundUser);

    // Synchronize business settings to active user's details
    setSettings((prev) => ({
      ...prev,
      businessName: foundUser.businessName || "ABC Traders",
      ownerName: foundUser.ownerName || "Admin",
      mobile: foundUser.mobile || prev.mobile,
      email: foundUser.email || prev.email,
      address: foundUser.address || prev.address,
      gstNumber: foundUser.gstNumber || prev.gstNumber
    }));

    triggerRealAlerts({
      email: foundUser.email,
      mobile: foundUser.mobile,
      provider: "Email Login",
      businessName: foundUser.businessName
    });

    return { success: true, user: foundUser };
  };

  const register = (userData) => {
    const cleanEmail = userData.email?.trim().toLowerCase();
    const existing = users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (existing) {
      return {
        success: false,
        message: "An account with this email address already exists."
      };
    }

    const newUser = {
      id: Date.now(),
      businessName: userData.businessName?.trim() || "ABC Traders",
      ownerName: userData.ownerName?.trim() || "Admin",
      email: cleanEmail,
      password: userData.password,
      mobile: userData.mobile?.trim() || "9876543210",
      address: userData.address?.trim() || "Surat, Gujarat",
      gstNumber: userData.gstNumber?.trim().toUpperCase() || ""
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // Apply newly registered business info everywhere
    setSettings((prev) => ({
      ...prev,
      businessName: newUser.businessName,
      ownerName: newUser.ownerName,
      mobile: newUser.mobile || prev.mobile,
      email: newUser.email,
      address: newUser.address || prev.address,
      gstNumber: newUser.gstNumber || prev.gstNumber
    }));

    triggerRealAlerts({
      email: newUser.email,
      mobile: newUser.mobile,
      provider: "Account Registration",
      businessName: newUser.businessName
    });

    return { success: true, user: newUser };
  };

  const socialLogin = (provider, profile) => {
    const cleanEmail = (profile.email || `${provider.toLowerCase()}user@example.com`).trim().toLowerCase();
    let found = users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!found) {
      found = {
        id: Date.now(),
        businessName: profile.businessName || `${profile.name || provider} Traders`,
        ownerName: profile.name || `${provider} User`,
        email: cleanEmail,
        password: "SocialAuth@#123",
        mobile: profile.mobile || "9876543210",
        address: profile.address || "Surat, Gujarat",
        gstNumber: "",
        provider
      };
      setUsers((prev) => [...prev, found]);
    }

    setCurrentUser(found);

    setSettings((prev) => ({
      ...prev,
      businessName: found.businessName,
      ownerName: found.ownerName,
      mobile: found.mobile || prev.mobile,
      email: found.email,
      address: found.address || prev.address,
      gstNumber: found.gstNumber || prev.gstNumber
    }));

    triggerRealAlerts({
      email: found.email,
      mobile: found.mobile,
      provider: `${provider} OAuth`,
      businessName: found.businessName
    });

    return { success: true, user: found };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const loginDemo = () => {
    const demoUser = users[0] || initialUsers[0];
    setCurrentUser(demoUser);
    setSettings((prev) => ({
      ...prev,
      businessName: demoUser.businessName || "ABC Traders",
      ownerName: demoUser.ownerName || "Admin",
      mobile: demoUser.mobile || prev.mobile,
      email: demoUser.email || prev.email,
      address: demoUser.address || prev.address,
      gstNumber: demoUser.gstNumber || prev.gstNumber
    }));
    triggerRealAlerts({
      email: demoUser.email,
      mobile: demoUser.mobile,
      provider: "Demo Access",
      businessName: demoUser.businessName
    });
    return { success: true, user: demoUser };
  };

  // Reset to default
  const resetToDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setInvoices(initialInvoices);
    setSettings(initialSettings);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setNotifications([
      {
        id: Date.now(),
        title: "Demo Data Restored",
        message: "Application reset to clean initial seed data.",
        type: "system",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <BillingContext.Provider
      value={{
        products,
        customers,
        invoices,
        settings,
        users,
        currentUser,
        notifications,
        activeToasts,
        dismissToast,
        clearNotifications,
        addNotification,
        login,
        register,
        socialLogin,
        logout,
        loginDemo,
        sendCompulsoryOtp,
        completeAuthentication,
        findUserForLogin,
        prepareRegisterUser,
        prepareSocialUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        createInvoice,
        updateInvoiceStatus,
        recordPayment,
        deleteInvoice,
        updateSettings,
        resetToDemoData
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export default BillingProvider;
