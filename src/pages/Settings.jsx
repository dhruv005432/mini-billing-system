import { useState } from "react";
import { useBilling } from "../context";

function Settings() {
  const { settings, updateSettings, resetToDemoData } = useBilling();

  const [businessForm, setBusinessForm] = useState({
    businessName: settings.businessName || "ABC Traders",
    ownerName: settings.ownerName || "Admin",
    mobile: settings.mobile || "9876543210",
    email: settings.email || "contact@abctraders.com",
    address: settings.address || "Surat, Gujarat",
    gstNumber: settings.gstNumber || "24XXXXXXXXXX"
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoicePrefix: settings.invoicePrefix || "INV",
    startingNumber: settings.startingNumber || 1001,
    currency: settings.currency || "₹",
    gstMode: settings.gstMode || "CGST + SGST",
    invoiceFooter: settings.invoiceFooter || "Thank you for your business!"
  });

  const [businessSaved, setBusinessSaved] = useState(false);
  const [invoiceSaved, setInvoiceSaved] = useState(false);

  const handleSaveBusiness = (e) => {
    e.preventDefault();
    updateSettings(businessForm);
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 3000);
  };

  const handleSaveInvoiceSettings = (e) => {
    e.preventDefault();
    updateSettings(invoiceForm);
    setInvoiceSaved(true);
    setTimeout(() => setInvoiceSaved(false), 3000);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset everything back to initial demo data? All newly added products, customers, and invoices will be reset."
      )
    ) {
      resetToDemoData();
      alert("Application successfully reset to demo data.");
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>System Settings</h2>
          <p>Configure your company profile, tax parameters, and invoice printing settings.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Business Profile Card */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-building me-2"></i>
                Business Profile
              </h5>
            </div>
            <div className="card-body">
              {businessSaved && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  Business profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveBusiness}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Business / Firm Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={businessForm.businessName}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, businessName: e.target.value })
                    }
                    placeholder="e.g. ABC Traders"
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Owner / Manager Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={businessForm.ownerName}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, ownerName: e.target.value })
                      }
                      placeholder="e.g. Admin"
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Contact Mobile</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={businessForm.mobile}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, mobile: e.target.value })
                      }
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={businessForm.email}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, email: e.target.value })
                    }
                    placeholder="contact@business.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Business Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={businessForm.address}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, address: e.target.value })
                    }
                    placeholder="402, Trade Square, Surat, Gujarat"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">GSTIN Registration Number</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={15}
                    value={businessForm.gstNumber}
                    onChange={(e) =>
                      setBusinessForm({
                        ...businessForm,
                        gstNumber: e.target.value.toUpperCase()
                      })
                    }
                    placeholder="24XXXXXXXXXX"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i> Save Business Profile
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Invoice Settings Card */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-receipt-cutoff me-2"></i>
                Invoice & Billing Settings
              </h5>
            </div>
            <div className="card-body">
              {invoiceSaved && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  Invoice settings saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveInvoiceSettings}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Invoice Prefix</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invoiceForm.invoicePrefix}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, invoicePrefix: e.target.value })
                      }
                      placeholder="INV"
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Starting Number</label>
                    <input
                      type="number"
                      className="form-control"
                      value={invoiceForm.startingNumber}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          startingNumber: parseInt(e.target.value, 10) || 1001
                        })
                      }
                      placeholder="1001"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Currency Symbol</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invoiceForm.currency}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, currency: e.target.value })
                      }
                      placeholder="₹"
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">GST Calculation Mode</label>
                    <select
                      className="form-select"
                      value={invoiceForm.gstMode}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, gstMode: e.target.value })
                      }
                    >
                      <option value="CGST + SGST">CGST + SGST (Dual GST)</option>
                      <option value="IGST">IGST (Integrated Tax)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Invoice Footer Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceForm.invoiceFooter}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        invoiceFooter: e.target.value
                      })
                    }
                    placeholder="Thank you for your business! Please visit again."
                  />
                  <small className="text-muted">
                    This message will print at the bottom of all generated tax invoices.
                  </small>
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i> Save Invoice Settings
                </button>
              </form>

              {/* Danger Zone / Reset */}
              <div className="border-top mt-4 pt-3">
                <h6 className="text-danger fw-bold mb-2">
                  <i className="bi bi-exclamation-triangle me-1"></i> Data Reset Options
                </h6>
                <p className="text-muted small mb-3">
                  Reset the database back to clean sample catalog, customers, and invoices.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleResetData}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>
                  Reset All to Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
