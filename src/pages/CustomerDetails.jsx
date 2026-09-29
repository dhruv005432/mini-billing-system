import { useParams, Link } from "react-router-dom";
import { useBilling } from "../context";
import { formatCurrency, formatDate } from "../utils/calculations";

function CustomerDetails() {
  const { id } = useParams();
  const { customers, invoices, settings } = useBilling();

  const customer = customers.find((c) => c.id === Number(id));

  if (!customer) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-person-x fs-1 text-muted d-block mb-3"></i>
        <h3>Customer Not Found</h3>
        <p className="text-muted">The customer you are looking for does not exist.</p>
        <Link to="/customers" className="btn btn-primary">
          Back to Customer List
        </Link>
      </div>
    );
  }

  // Filter invoices for this customer
  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === customer.id || inv.customerMobile === customer.mobile
  );

  const totalPurchase = customerInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  );

  const paidAmount = customerInvoices
    .filter((inv) => inv.paymentStatus === "Paid")
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  const pendingAmount = totalPurchase - paidAmount;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Customer Details</h2>
          <p>Detailed profile, lifetime purchase metrics, and transaction history.</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/customers" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back
          </Link>
          <Link
            to="/billing"
            className="btn btn-primary"
            onClick={() => {
              // Can pre-select or user can choose customer on billing page
            }}
          >
            <i className="bi bi-receipt me-1"></i> New Invoice
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Customer Information Card */}
        <div className="col-12 col-md-5">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-person me-2"></i>
                Profile Information
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 fw-bold"
                  style={{ width: "55px", height: "55px", fontSize: "22px" }}
                >
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">{customer.name}</h4>
                  <span className="badge bg-secondary-subtle text-secondary">
                    {customer.customerType || "Individual"}
                  </span>
                </div>
              </div>

              <div className="list-group list-group-flush border-top">
                <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                  <span className="text-muted">Mobile Number:</span>
                  <strong>{customer.mobile}</strong>
                </div>
                <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                  <span className="text-muted">Email:</span>
                  <span>{customer.email || "-"}</span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                  <span className="text-muted">GSTIN:</span>
                  <span>{customer.gstNumber || "-"}</span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                  <span className="text-muted">City / State:</span>
                  <span>
                    {customer.city ? `${customer.city}, ${customer.state || ""}` : "-"}
                  </span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                  <span className="text-muted">Pincode:</span>
                  <span>{customer.pincode || "-"}</span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                  <span className="text-muted">Address:</span>
                  <span className="text-end" style={{ maxWidth: "60%" }}>
                    {customer.address || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-cash-coin me-2"></i>
                Purchase Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-light rounded text-center">
                    <span className="text-muted small d-block mb-1">Total Invoices</span>
                    <h3 className="mb-0 fw-bold text-dark">{customerInvoices.length}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded text-center">
                    <span className="text-muted small d-block mb-1">Total Purchase</span>
                    <h4 className="mb-0 fw-bold text-primary">
                      {formatCurrency(totalPurchase, settings.currency)}
                    </h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-success-subtle text-success rounded text-center">
                    <span className="small d-block mb-1">Total Paid</span>
                    <h4 className="mb-0 fw-bold">
                      {formatCurrency(paidAmount, settings.currency)}
                    </h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-danger-subtle text-danger rounded text-center">
                    <span className="small d-block mb-1">Pending Balance</span>
                    <h4 className="mb-0 fw-bold">
                      {formatCurrency(pendingAmount, settings.currency)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="col-12 col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-clock-history me-2"></i>
                Invoice History ({customerInvoices.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {customerInvoices.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Payment Status</th>
                        <th>Method</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            <Link to={`/invoices/${inv.id}`} className="fw-bold text-primary">
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td>{formatDate(inv.date)}</td>
                          <td className="fw-bold">
                            {formatCurrency(inv.total, settings.currency)}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                inv.paymentStatus === "Paid"
                                  ? "bg-success"
                                  : inv.paymentStatus === "Partial"
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}
                            >
                              {inv.paymentStatus || "Paid"}
                            </span>
                          </td>
                          <td>{inv.paymentMethod || "Cash"}</td>
                          <td className="text-end">
                            <Link
                              to={`/invoices/${inv.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-eye"></i> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <p className="mb-0">No invoices generated for this customer yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
