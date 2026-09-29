import { useState } from "react";
import { Link } from "react-router-dom";
import { useBilling } from "../context";
import { formatCurrency } from "../utils/calculations";

function Customers() {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer, settings } = useBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialForm = {
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "Surat",
    state: "Gujarat",
    pincode: "",
    gstNumber: "",
    customerType: "Individual"
  };

  const [form, setForm] = useState(initialForm);

  // Compute spend and invoice count for each customer
  const customerStats = customers.map((c) => {
    const customerInvoices = invoices.filter(
      (inv) => inv.customerId === c.id || inv.customerMobile === c.mobile
    );
    const totalSpent = customerInvoices.reduce(
      (sum, inv) => sum + (Number(inv.total) || 0),
      0
    );
    return {
      ...c,
      invoiceCount: customerInvoices.length,
      totalSpent
    };
  });

  const filteredCustomers = customerStats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "All" || c.customerType === typeFilter;

    return matchesSearch && matchesType;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (cust) => {
    setIsEditing(true);
    setCurrentId(cust.id);
    setForm({
      name: cust.name || "",
      mobile: cust.mobile || "",
      email: cust.email || "",
      address: cust.address || "",
      city: cust.city || "Surat",
      state: cust.state || "Gujarat",
      pincode: cust.pincode || "",
      gstNumber: cust.gstNumber || "",
      customerType: cust.customerType || "Individual"
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      alert("Customer Name and Mobile Number are required.");
      return;
    }

    if (isEditing) {
      updateCustomer(currentId, form);
    } else {
      addCustomer(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      deleteCustomer(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Customer Management</h2>
          <p>View, create, and manage your customer database and credit history.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-person-plus me-1"></i> Add Customer
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, phone, email, or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <label className="text-muted small fw-semibold text-nowrap">Type:</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-3 text-md-end text-muted small">
            Showing <strong>{filteredCustomers.length}</strong> of {customers.length}
          </div>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>City / State</th>
                  <th>GST Number</th>
                  <th>Type</th>
                  <th>Invoices</th>
                  <th>Total Spent</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`} className="fw-bold text-primary">
                          {c.name}
                        </Link>
                        {c.email && (
                          <small className="text-muted d-block">{c.email}</small>
                        )}
                      </td>
                      <td>
                        <span>{c.mobile}</span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {c.city ? `${c.city}, ${c.state || ""}` : c.address || "-"}
                        </small>
                      </td>
                      <td>
                        {c.gstNumber ? (
                          <span className="badge bg-light text-dark border">
                            {c.gstNumber}
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary">
                          {c.customerType || "Individual"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary">
                          {c.invoiceCount}
                        </span>
                      </td>
                      <td className="fw-bold text-dark">
                        {formatCurrency(c.totalSpent, settings.currency)}
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/customers/${c.id}`}
                          className="btn btn-sm btn-outline-info me-1"
                          title="View Profile"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          title="Edit Customer"
                          onClick={() => openEditModal(c)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Customer"
                          onClick={() => handleDelete(c.id, c.name)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-1 d-block mb-2"></i>
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Customer Details" : "Add New Customer"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Customer Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Raj Patel"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Mobile Number (10 digits) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        className="form-control"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="raj@example.com"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Customer Type</label>
                      <select
                        className="form-select"
                        value={form.customerType}
                        onChange={(e) =>
                          setForm({ ...form, customerType: e.target.value })
                        }
                      >
                        <option value="Individual">Individual</option>
                        <option value="Business">Business</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Retail">Retail</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Address / Street</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Shop / House No, Street name"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="Surat"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        placeholder="Gujarat"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="form-control"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        placeholder="395006"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        className="form-control"
                        value={form.gstNumber}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gstNumber: e.target.value.toUpperCase()
                          })
                        }
                        placeholder="24XXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditing ? "Update Customer" : "Save Customer"}
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

export default Customers;
