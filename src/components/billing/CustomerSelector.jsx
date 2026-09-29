import { useState } from "react";
import { useBilling } from "../../context";

function CustomerSelector({ customer, setCustomer }) {
  const { customers, addCustomer } = useBilling();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "Surat",
    state: "Gujarat",
    pincode: "",
    gstNumber: "",
    customerType: "Individual"
  });

  const handleSelectCustomer = (e) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) {
      // Clear or keep manual input
      setCustomer({
        id: null,
        name: "",
        mobile: "",
        email: "",
        address: "",
        gstNumber: ""
      });
      return;
    }

    const found = customers.find((c) => c.id === selectedId);
    if (found) {
      setCustomer({
        id: found.id,
        name: found.name,
        mobile: found.mobile,
        email: found.email || "",
        address: found.address ? `${found.address}, ${found.city || ""}`.trim() : "",
        gstNumber: found.gstNumber || ""
      });
    }
  };

  const handleQuickAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.mobile.trim()) {
      alert("Please provide customer name and mobile number.");
      return;
    }

    const created = addCustomer(newCustomerForm);
    setCustomer({
      id: created.id,
      name: created.name,
      mobile: created.mobile,
      email: created.email,
      address: `${created.address}, ${created.city}`,
      gstNumber: created.gstNumber
    });

    setShowAddModal(false);
    setNewCustomerForm({
      name: "",
      mobile: "",
      email: "",
      address: "",
      city: "Surat",
      state: "Gujarat",
      pincode: "",
      gstNumber: "",
      customerType: "Individual"
    });
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">
          <i className="bi bi-person-badge me-2"></i>
          Customer Information
        </h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-person-plus me-1"></i>
          + Quick Add Customer
        </button>
      </div>

      <div className="card-body">
        <div className="row g-3">
          {/* Quick Select from existing */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">
              Select Saved Customer
            </label>
            <select
              className="form-select"
              value={customer.id || ""}
              onChange={handleSelectCustomer}
            >
              <option value="">-- Choose Existing or Type Below --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">
              Customer Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Raj Patel"
              value={customer.name}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">
              Mobile Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className="form-control"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={customer.mobile}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, mobile: e.target.value }))
              }
              required
            />
          </div>

          {/* Email */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. raj@gmail.com"
              value={customer.email}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          {/* Address */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Billing Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ring Road, Surat"
              value={customer.address}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          {/* GST Number */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">GSTIN (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="24XXXXXXXXXX"
              maxLength={15}
              value={customer.gstNumber}
              onChange={(e) =>
                setCustomer((prev) => ({
                  ...prev,
                  gstNumber: e.target.value.toUpperCase()
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Quick Add New Customer</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleQuickAddCustomer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomerForm.name}
                      onChange={(e) =>
                        setNewCustomerForm({
                          ...newCustomerForm,
                          name: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-control"
                      value={newCustomerForm.mobile}
                      onChange={(e) =>
                        setNewCustomerForm({
                          ...newCustomerForm,
                          mobile: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newCustomerForm.email}
                      onChange={(e) =>
                        setNewCustomerForm({
                          ...newCustomerForm,
                          email: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">City & Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomerForm.address}
                      onChange={(e) =>
                        setNewCustomerForm({
                          ...newCustomerForm,
                          address: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomerForm.gstNumber}
                      onChange={(e) =>
                        setNewCustomerForm({
                          ...newCustomerForm,
                          gstNumber: e.target.value.toUpperCase()
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save & Select Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerSelector;
