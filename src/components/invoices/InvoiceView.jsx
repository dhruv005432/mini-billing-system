import { useBilling } from "../../context";

function InvoiceView({
  invoice,
  onClose
}) {
  const { settings } = useBilling();

  if (!invoice) {
    return null;
  }

  const businessName = settings?.businessName || "ABC Traders";
  const businessAddress = settings?.address || "Surat, Gujarat, India";
  const businessEmail = settings?.email || "business@example.com";
  const businessPhone = settings?.phone || "+91 98765 43210";
  const businessGst = settings?.gstin || "24ABCDE1234F1Z5";

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = invoice.customerMobile?.replace(/\D/g, "");
    if (!phone) {
      alert("No customer phone number available for WhatsApp sharing.");
      return;
    }
    const message = encodeURIComponent(
      `Hello ${invoice.customerName},\n\nThank you for choosing ${businessName}.\nHere is your Tax Invoice #${invoice.invoiceNumber} for amount ₹${Number(invoice.total || 0).toFixed(2)}.\n\nDate: ${invoice.date}\nPayment Status: ${invoice.paymentStatus}\n\nThank you!`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${message}`, "_blank");
  };

  return (
    <div className="invoice-container">
      {/* ACTION BAR */}
      <div className="invoice-actions no-print">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to List
        </button>

        <div className="d-flex gap-2">
          {invoice.customerMobile && (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleWhatsApp}
              title="Share invoice on WhatsApp"
            >
              <i className="bi bi-whatsapp me-2"></i>
              WhatsApp
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
          >
            <i className="bi bi-printer me-2"></i>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* INVOICE PAPER */}
      <div className="invoice-paper">
        {/* HEADER */}
        <div className="invoice-header">
          <div>
            <h1 className="invoice-company-name">
              {businessName}
            </h1>
            <p className="mb-1 text-muted">
              Business Billing & Invoice System
            </p>
            <p className="mb-1">
              {businessAddress}
            </p>
            <p className="mb-1">
              Email: {businessEmail} | Phone: {businessPhone}
            </p>
            {businessGst && (
              <p className="mb-0 small text-muted">
                <strong>GSTIN:</strong> {businessGst}
              </p>
            )}
          </div>

          <div className="text-end">
            <h2 className="text-primary fw-bold">
              TAX INVOICE
            </h2>
            <p className="mb-1">
              <strong>Invoice:</strong> {invoice.invoiceNumber}
            </p>
            <p className="mb-0">
              <strong>Date:</strong> {invoice.date}
            </p>
          </div>
        </div>

        <hr />

        {/* CUSTOMER & PAYMENT DETAILS */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="invoice-section-title">
              BILL TO
            </h6>
            <h5>{invoice.customerName}</h5>
            <p className="mb-1">
              <strong>Mobile:</strong> {invoice.customerMobile || "-"}
            </p>
            {invoice.customerEmail && (
              <p className="mb-1">
                <strong>Email:</strong> {invoice.customerEmail}
              </p>
            )}
            {invoice.customerAddress && (
              <p className="mb-1">
                <strong>Address:</strong> {invoice.customerAddress}
              </p>
            )}
            {invoice.customerGstNumber && (
              <p className="mb-0">
                <strong>GSTIN:</strong> {invoice.customerGstNumber}
              </p>
            )}
          </div>

          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <h6 className="invoice-section-title">
              PAYMENT DETAILS
            </h6>
            <p className="mb-1">
              <strong>Method:</strong> {invoice.paymentMethod || "Cash"}
            </p>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span
                className={
                  invoice.paymentStatus === "Paid"
                    ? "text-success fw-bold"
                    : invoice.paymentStatus === "Pending"
                    ? "text-warning fw-bold"
                    : "text-info fw-bold"
                }
              >
                {invoice.paymentStatus || "Paid"}
              </span>
            </p>
            {invoice.amountPaid !== undefined && (
              <p className="mb-1">
                <strong>Paid Amount:</strong> ₹{Number(invoice.amountPaid || 0).toFixed(2)}
              </p>
            )}
            {invoice.amountDue !== undefined && (
              <p className="mb-0">
                <strong>Outstanding:</strong>{" "}
                <span className={invoice.amountDue > 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                  ₹{Number(invoice.amountDue || 0).toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="table-responsive">
          <table className="table invoice-items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty</th>
                <th>GST</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => {
                const subtotalVal = item.subtotal !== undefined
                  ? Number(item.subtotal)
                  : Number(item.price || 0) * Number(item.quantity || 0);

                return (
                  <tr key={`${item.productId || item.id || index}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{item.name || item.productName || "Product"}</strong>
                    </td>
                    <td>{item.sku || "-"}</td>
                    <td>₹{Number(item.price || 0).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>{item.gst || 0}%</td>
                    <td className="text-end">₹{subtotalVal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTAL CALCULATION */}
        <div className="row justify-content-end">
          <div className="col-md-5">
            <div className="invoice-total-box">
              <div className="invoice-total-row">
                <span>Subtotal</span>
                <strong>₹{Number(invoice.subtotal || 0).toFixed(2)}</strong>
              </div>

              {Number(invoice.discount || 0) > 0 && (
                <div className="invoice-total-row">
                  <span>Discount</span>
                  <strong className="text-danger">-₹{Number(invoice.discount || 0).toFixed(2)}</strong>
                </div>
              )}

              <div className="invoice-total-row">
                <span>Taxable Amount</span>
                <strong>₹{Number(invoice.taxableAmount || 0).toFixed(2)}</strong>
              </div>

              <div className="invoice-total-row">
                <span>CGST</span>
                <strong>₹{Number(invoice.cgst || 0).toFixed(2)}</strong>
              </div>

              <div className="invoice-total-row">
                <span>SGST</span>
                <strong>₹{Number(invoice.sgst || 0).toFixed(2)}</strong>
              </div>

              <hr />

              <div className="invoice-grand-total">
                <span>GRAND TOTAL</span>
                <strong className="text-primary">
                  ₹{Number(invoice.total || 0).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="invoice-footer">
          <div>
            <h6>Thank You!</h6>
            <p className="mb-0">
              Thank you for doing business with us.
            </p>
          </div>

          <div className="text-end">
            <p className="mb-1 small">
              This is a computer-generated tax invoice.
            </p>
            <strong>{businessName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
