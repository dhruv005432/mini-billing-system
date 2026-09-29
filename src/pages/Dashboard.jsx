import { Link } from "react-router-dom";
import { useBilling } from "../context";
import SummaryCard from "../components/dashboard/SummaryCard";
import { formatCurrency, formatDate } from "../utils/calculations";

function Dashboard() {
  const { invoices, customers, products, settings } = useBilling();

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculations
  const todayInvoices = invoices.filter((inv) => inv.date === todayStr);
  const todaySales = todayInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  const pendingPayments = invoices
    .filter((inv) => inv.paymentStatus === "Pending" || inv.paymentStatus === "Partial")
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>
            Welcome back! Here's your live billing and sales overview.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/billing" className="btn btn-primary d-flex align-items-center">
            <i className="bi bi-plus-lg me-2"></i>
            New Invoice
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <SummaryCard
          title="Today's Sales"
          value={formatCurrency(todaySales, settings.currency)}
          icon="bi-cash-stack"
          description={`${todayInvoices.length} bill${todayInvoices.length === 1 ? "" : "s"} today`}
          color="primary"
        />

        <SummaryCard
          title="Total Invoices"
          value={invoices.length}
          icon="bi-receipt"
          description={`Overall sales: ${formatCurrency(totalSales, settings.currency)}`}
          color="info"
        />

        <SummaryCard
          title="Total Customers"
          value={customers.length}
          icon="bi-people"
          description="Registered clients"
          color="success"
        />

        <SummaryCard
          title="Products in Catalog"
          value={products.length}
          icon="bi-box-seam"
          description={
            pendingPayments > 0
              ? `Pending pay: ${formatCurrency(pendingPayments, settings.currency)}`
              : "All accounts cleared"
          }
          color="warning"
        />
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary p-2">
              <i className="bi bi-lightning-charge fs-5"></i>
            </span>
            <div>
              <strong className="d-block">Quick Billing Actions</strong>
              <small className="text-muted">Direct shortcuts to daily operations</small>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/billing" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-receipt me-1"></i> New Bill
            </Link>
            <Link to="/products" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-box-seam me-1"></i> Manage Products
            </Link>
            <Link to="/customers" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-person-plus me-1"></i> Add Customer
            </Link>
            <Link to="/reports" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-bar-chart me-1"></i> GST Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="dashboard-section shadow-sm border-0">
        <div className="section-header">
          <div>
            <h5 className="fw-bold mb-1">Recent Invoices</h5>
            <p className="text-muted small mb-0">Your latest billing transactions</p>
          </div>

          {invoices.length > 0 && (
            <Link to="/invoices" className="btn btn-outline-primary btn-sm">
              View All Invoices ({invoices.length})
            </Link>
          )}
        </div>

        {recentInvoices.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="fw-bold text-primary"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td>
                      <strong>{inv.customerName}</strong>
                      {inv.customerMobile && (
                        <small className="text-muted d-block">{inv.customerMobile}</small>
                      )}
                    </td>
                    <td>{formatDate(inv.date)}</td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {inv.items?.length || 0} item(s)
                      </span>
                    </td>
                    <td className="fw-bold text-dark">
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
                    <td className="text-end">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="btn btn-sm btn-outline-primary"
                        title="View & Print"
                      >
                        <i className="bi bi-eye me-1"></i> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h5>No invoices yet</h5>
            <p className="text-muted">Create your first invoice to see it here.</p>
            <Link to="/billing" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              Create First Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
