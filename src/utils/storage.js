// LocalStorage helper utilities for Mini Billing System

export const STORAGE_KEYS = {
  PRODUCTS: "mini_billing_products",
  CUSTOMERS: "mini_billing_customers",
  INVOICES: "mini_billing_invoices",
  SETTINGS: "mini_billing_settings",
  AUTH_USER: "mini_billing_auth_user",
  USERS: "mini_billing_users",
  NOTIFICATIONS: "mini_billing_notifications"
};

export const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};

// Aliases for Phase components (supports both shorthand "invoices" and full "mini_billing_invoices")
export const getData = (key, defaultValue = []) => {
  const upper = typeof key === "string" ? key.toUpperCase() : "";
  const resolvedKey = STORAGE_KEYS[upper] || key;
  return getStorageItem(resolvedKey, defaultValue);
};

export const setData = (key, value) => {
  const upper = typeof key === "string" ? key.toUpperCase() : "";
  const resolvedKey = STORAGE_KEYS[upper] || key;
  setStorageItem(resolvedKey, value);
};
