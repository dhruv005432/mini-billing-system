import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InvoiceTable from "../components/invoices/InvoiceTable";
import InvoiceView from "../components/invoices/InvoiceView";
import { useBilling } from "../context";

function Invoices() {
  const { invoices, deleteInvoice } = useBilling();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // =========================
  // FILTER
  // =========================
  const filteredInvoices = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return (invoices || [])
      .filter((invoice) => {
        const matchesSearch =
          !searchText ||
          invoice.invoiceNumber?.toLowerCase().includes(searchText) ||
          invoice.customerName?.toLowerCase().includes(searchText) ||
          invoice.customerMobile?.toLowerCase().includes(searchText);

        const matchesStatus =
          statusFilter === "All" || invoice.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [invoices, search, statusFilter]);

  // =========================
  // VIEW
  // =========================
  const handleView = (invoice) => {
    setViewingInvoice(invoice);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =========================
  // DELETE WITH STOCK RESTORATION
  // =========================
  const handleDelete = (invoice) => {
    const confirmed = window.confirm(
      `Delete invoice ${invoice.invoiceNumber}? Product stock will be automatically restored.`
    );

    if (!confirmed) {
      return;
    }

    deleteInvoice(invoice.id);

    if (viewingInvoice?.id === invoice.id) {
      setViewingInvoice(null);
    }
  };

  // =========================
  // SUMMARY
  // =========================
  const totalInvoiceAmount = filteredInvoices.reduce(
    (total, invoice) => total + Number(invoice.total || 0),
    0
  );

  const paidInvoices = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "Paid"
  ).length;

  // =========================
  // UI
  // =========================
  if (viewingInvoice) {
    return (
      <div className="container-fluid py-2">
        <InvoiceView
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Invoices</h2>
          <p className="text-muted mb-0">Manage, view, and print all invoices</p>
        </div>
        <Link to="/billing" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i> New Invoice
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted">Total Invoices</small>
                  <h3 className="mb-0 mt-1">{filteredInvoices.length}</h3>
                </div>
                <div className="invoice-stat-icon">
                  <i className="bi bi-receipt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted">Paid Invoices</small>
                  <h3 className="mb-0 mt-1 text-success">{paidInvoices}</h3>
                </div>
                <div className="invoice-stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted">Filtered Sales</small>
                  <h3 className="mb-0 mt-1 text-primary">
                    ₹{totalInvoiceAmount.toFixed(2)}
                  </h3>
                </div>
                <div className="invoice-stat-icon">
                  <i className="bi bi-currency-rupee"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-7">
              <label className="form-label fw-semibold">Search Invoice</label>
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
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <InvoiceTable
        invoices={filteredInvoices}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Invoices;
