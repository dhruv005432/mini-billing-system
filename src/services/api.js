const API_BASE_URL = "http://localhost:5000/api";

export const api = {
  // Generic fetch helper
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth & OTP
  sendOtp: (data) => api.request("/auth/send-otp", { method: "POST", body: JSON.stringify(data) }),
  verifyOtp: (data) => api.request("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => api.request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => api.request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getUsers: () => api.request("/auth/users"),

  // Products
  getProducts: () => api.request("/products"),
  createProduct: (data) => api.request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => api.request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => api.request(`/products/${id}`, { method: "DELETE" }),

  // Customers
  getCustomers: () => api.request("/customers"),
  createCustomer: (data) => api.request("/customers", { method: "POST", body: JSON.stringify(data) }),
  updateCustomer: (id, data) => api.request(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id) => api.request(`/customers/${id}`, { method: "DELETE" }),

  // Invoices
  getInvoices: () => api.request("/invoices"),
  createInvoice: (data) => api.request("/invoices", { method: "POST", body: JSON.stringify(data) }),
  deleteInvoice: (id) => api.request(`/invoices/${id}`, { method: "DELETE" }),

  // Payments
  recordPayment: (invoiceId, data) => api.request(`/payments/${invoiceId}`, { method: "POST", body: JSON.stringify(data) }),
  getNotificationLogs: () => api.request("/payments/logs"),

  // Settings
  getSettings: () => api.request("/settings"),
  updateSettings: (data) => api.request("/settings", { method: "PUT", body: JSON.stringify(data) })
};
