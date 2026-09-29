function InvoiceTable({
  invoices,
  onView,
  onDelete
}) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-receipt fs-1 text-muted"></i>
          <h5 className="mt-3">No invoices found</h5>
          <p className="text-muted mb-0">
            Create your first invoice from the Billing page.
          </p>
        </div>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-success-subtle text-success";
      case "Pending":
        return "bg-warning-subtle text-warning";
      case "Partial":
        return "bg-info-subtle text-info";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong className="text-primary">{invoice.invoiceNumber}</strong>
                  </td>
                  <td>{invoice.date}</td>
                  <td>
                    <strong>{invoice.customerName}</strong>
                    {invoice.customerMobile && (
                      <small className="d-block text-muted">{invoice.customerMobile}</small>
                    )}
                  </td>
                  <td>{invoice.items?.length || 0}</td>
                  <td>{invoice.paymentMethod || "Cash"}</td>
                  <td>
                    <span className={`badge ${getStatusClass(invoice.paymentStatus || "Paid")}`}>
                      {invoice.paymentStatus || "Paid"}
                    </span>
                  </td>
                  <td>
                    <strong>₹{Number(invoice.total || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        title="View Invoice"
                        onClick={() => onView(invoice)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Invoice"
                        onClick={() => onDelete(invoice)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvoiceTable;
