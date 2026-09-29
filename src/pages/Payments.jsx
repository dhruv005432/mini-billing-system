import { useMemo, useState } from "react";
import PaymentForm from "../components/payments/PaymentForm";
import PaymentHistory from "../components/payments/PaymentHistory";
import { useBilling } from "../context";

function Payments() {
  const { invoices, recordPayment } = useBilling();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Normalize invoices to guarantee amountPaid, amountDue, paymentHistory
  const normalizedInvoices = useMemo(() => {
    return (invoices || []).map((invoice) => {
      const total = Number(invoice.total || 0);
      const amountPaid = Number(
        invoice.amountPaid !== undefined
          ? invoice.amountPaid
          : invoice.paymentStatus === "Paid"
          ? total
          : 0
      );
      const amountDue =
        invoice.amountDue !== undefined
          ? Number(invoice.amountDue)
          : Math.max(total - amountPaid, 0);

      return {
        ...invoice,
        amountPaid,
        amountDue,
        paymentHistory: invoice.paymentHistory || []
      };
    });
  }, [invoices]);

  // Keep selected invoice in sync with normalized invoices
  const activeSelectedInvoice = useMemo(() => {
    if (!selectedInvoice) return null;
    return normalizedInvoices.find((inv) => inv.id === selectedInvoice.id) || null;
  }, [selectedInvoice, normalizedInvoices]);

  // =========================
  // FILTER INVOICES
  // =========================
  const filteredInvoices = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return normalizedInvoices.filter((invoice) => {
      const matchesSearch =
        !searchText ||
        invoice.invoiceNumber?.toLowerCase().includes(searchText) ||
        invoice.customerName?.toLowerCase().includes(searchText) ||
        invoice.customerMobile?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || invoice.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [normalizedInvoices, search, statusFilter]);

  // =========================
  // RECORD PAYMENT
  // =========================
  const handlePayment = ({ amount, paymentMethod }) => {
    if (!activeSelectedInvoice) return;

    recordPayment(activeSelectedInvoice.id, { amount, paymentMethod });
    alert(`Payment of ₹${Number(amount).toFixed(2)} recorded successfully.`);
  };

  // =========================
  // SUMMARY
  // =========================
  const totalCollected = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amountPaid || 0),
    0
  );

  const totalOutstanding = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amountDue || 0),
    0
  );

  const paidCount = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "Paid"
  ).length;

  const pendingCount = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "Pending"
  ).length;

  const partialCount = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "Partial"
  ).length;

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="mb-1">Payments & Outstanding</h2>
        <p className="text-muted mb-0">
          Manage customer payments, track settlements, and review payment logs.
        </p>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Collected</small>
              <h3 className="mt-1 mb-0 text-success">
                ₹{totalCollected.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Outstanding</small>
              <h3 className="mt-1 mb-0 text-danger">
                ₹{totalOutstanding.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Paid Invoices</small>
              <h3 className="mt-1 mb-0 text-primary">{paidCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Partial / Pending</small>
              <h3 className="mt-1 mb-0 text-warning">
                {partialCount + pendingCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT FORM (MODAL/PANEL WHEN AN INVOICE IS SELECTED) */}
      {activeSelectedInvoice && (
        <PaymentForm
          invoice={activeSelectedInvoice}
          onSave={handlePayment}
          onCancel={() => setSelectedInvoice(null)}
        />
      )}

      {/* PAYMENT HISTORY */}
      {activeSelectedInvoice && (
        <div className="mb-4">
          <PaymentHistory invoice={activeSelectedInvoice} />
        </div>
      )}

      {/* SEARCH / FILTER BAR */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-7">
              <label className="form-label fw-semibold">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Invoice number, customer name or mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearch("")}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Payment Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cash-stack fs-1 text-muted"></i>
              <h5 className="mt-3">No invoices found</h5>
              <p className="text-muted mb-0">No records match your filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <strong className="text-primary">{invoice.invoiceNumber}</strong>
                        <small className="d-block text-muted">{invoice.date}</small>
                      </td>
                      <td>
                        <strong>{invoice.customerName}</strong>
                        {invoice.customerMobile && (
                          <small className="d-block text-muted">{invoice.customerMobile}</small>
                        )}
                      </td>
                      <td>
                        <strong>₹{Number(invoice.total || 0).toFixed(2)}</strong>
                      </td>
                      <td className="text-success fw-semibold">
                        ₹{Number(invoice.amountPaid || 0).toFixed(2)}
                      </td>
                      <td className={invoice.amountDue > 0 ? "text-danger fw-semibold" : "text-muted"}>
                        ₹{Number(invoice.amountDue || 0).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={
                            invoice.paymentStatus === "Paid"
                              ? "badge bg-success-subtle text-success"
                              : invoice.paymentStatus === "Partial"
                              ? "badge bg-info-subtle text-info"
                              : "badge bg-warning-subtle text-warning"
                          }
                        >
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          {Number(invoice.amountDue || 0) > 0 ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                window.scrollTo({ top: 150, behavior: "smooth" });
                              }}
                            >
                              <i className="bi bi-cash-coin me-1"></i> Pay
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                window.scrollTo({ top: 150, behavior: "smooth" });
                              }}
                              title="View History"
                            >
                              <i className="bi bi-check-circle text-success me-1"></i> History
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;
