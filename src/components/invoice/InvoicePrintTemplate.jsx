import { formatCurrency, formatDate } from "../../utils/calculations";

function InvoicePrintTemplate({ invoice, businessSettings }) {
  if (!invoice) return null;

  const currency = businessSettings?.currency || "₹";

  return (
    <div className="invoice-paper card border-0 shadow-sm p-4 p-md-5 my-3">
      {/* Header */}
      <div className="text-center border-bottom pb-4 mb-4">
        <span className="badge bg-primary-subtle text-primary px-3 py-2 text-uppercase letter-spacing-1 mb-2">
          TAX INVOICE
        </span>
        <h2 className="fw-bold mb-1">{businessSettings?.businessName || "Mini Billing System"}</h2>
        <p className="text-muted mb-1">{businessSettings?.address || "Surat, Gujarat"}</p>
        <p className="text-muted mb-1">
          <strong>GSTIN:</strong> {businessSettings?.gstNumber || "24XXXXXXXXXX"} | <strong>Phone:</strong> {businessSettings?.mobile || "9876543210"}
        </p>
        {businessSettings?.email && (
          <p className="text-muted mb-0 small">Email: {businessSettings.email}</p>
        )}
      </div>

      {/* Meta: Invoice info & Bill To */}
      <div className="row g-4 mb-4 pb-3 border-bottom">
        <div className="col-sm-6">
          <h6 className="text-uppercase text-secondary fw-bold small mb-2">Bill To:</h6>
          <h5 className="fw-bold mb-1">{invoice.customerName || "Walk-in Customer"}</h5>
          {invoice.customerMobile && (
            <p className="mb-1 text-muted">
              <i className="bi bi-telephone me-1"></i>
              {invoice.customerMobile}
            </p>
          )}
          {invoice.customerAddress && (
            <p className="mb-1 text-muted">
              <i className="bi bi-geo-alt me-1"></i>
              {invoice.customerAddress}
            </p>
          )}
          {invoice.customerGst && (
            <p className="mb-0 text-muted">
              <strong>GSTIN:</strong> {invoice.customerGst}
            </p>
          )}
        </div>

        <div className="col-sm-6 text-sm-end">
          <h6 className="text-uppercase text-secondary fw-bold small mb-2">Invoice Details:</h6>
          <p className="mb-1">
            <span className="text-muted">Invoice No:</span>{" "}
            <strong className="fs-5 text-primary">{invoice.invoiceNumber}</strong>
          </p>
          <p className="mb-1">
            <span className="text-muted">Date:</span>{" "}
            <strong>{formatDate(invoice.date)}</strong>
          </p>
          <p className="mb-1">
            <span className="text-muted">Payment Status:</span>{" "}
            <span
              className={`badge ${
                invoice.paymentStatus === "Paid"
                  ? "bg-success"
                  : invoice.paymentStatus === "Partial"
                  ? "bg-warning text-dark"
                  : "bg-danger"
              }`}
            >
              {invoice.paymentStatus || "Paid"}
            </span>
          </p>
          <p className="mb-0">
            <span className="text-muted">Payment Mode:</span>{" "}
            <strong>{invoice.paymentMethod || "Cash"}</strong>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="table-responsive mb-4">
        <table className="table table-bordered align-middle">
          <thead className="table-light text-secondary">
            <tr>
              <th style={{ width: "5%" }}>#</th>
              <th>Product / Description</th>
              <th className="text-center" style={{ width: "10%" }}>Qty</th>
              <th className="text-end" style={{ width: "15%" }}>Price</th>
              <th className="text-center" style={{ width: "10%" }}>GST %</th>
              <th className="text-end" style={{ width: "15%" }}>Discount</th>
              <th className="text-end" style={{ width: "18%" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-muted">{idx + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.sku && <small className="text-muted d-block">{item.sku}</small>}
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatCurrency(item.price, currency)}</td>
                  <td className="text-center">{item.gst}%</td>
                  <td className="text-end">{formatCurrency(item.discount || 0, currency)}</td>
                  <td className="text-end fw-bold">{formatCurrency(item.total, currency)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-3 text-muted">
                  No items listed
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary calculation */}
      <div className="row justify-content-end mb-4">
        <div className="col-md-6 col-lg-5">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td className="text-muted">Subtotal:</td>
                <td className="text-end fw-semibold">
                  {formatCurrency(invoice.subtotal, currency)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">Discount:</td>
                <td className="text-end text-danger fw-semibold">
                  - {formatCurrency(invoice.discount || 0, currency)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">Taxable Amount:</td>
                <td className="text-end fw-semibold">
                  {formatCurrency(invoice.taxableAmount, currency)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">CGST (Central GST):</td>
                <td className="text-end text-secondary fw-semibold">
                  + {formatCurrency(invoice.cgst, currency)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">SGST (State GST):</td>
                <td className="text-end text-secondary fw-semibold">
                  + {formatCurrency(invoice.sgst, currency)}
                </td>
              </tr>
              <tr className="border-top border-2">
                <td className="fs-5 fw-bold text-dark pt-2">Grand Total:</td>
                <td className="fs-5 fw-bold text-primary text-end pt-2">
                  {formatCurrency(invoice.total, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Notes & Sign */}
      <div className="border-top pt-4 mt-auto">
        <div className="row align-items-end">
          <div className="col-8">
            <h6 className="fw-bold mb-1">Terms & Conditions:</h6>
            <p className="small text-muted mb-1">
              1. Goods once sold will not be taken back or exchanged after 7 days.
            </p>
            <p className="small text-muted mb-0">
              2. Subject to Surat jurisdiction only.
            </p>
            {invoice.notes && (
              <p className="small text-primary mt-2 mb-0">
                <strong>Note:</strong> {invoice.notes}
              </p>
            )}
          </div>
          <div className="col-4 text-end">
            <div style={{ height: "45px" }}></div>
            <p className="fw-semibold mb-0 small text-uppercase">Authorized Signatory</p>
            <small className="text-muted">{businessSettings?.businessName}</small>
          </div>
        </div>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted fst-italic small mb-0">
            {businessSettings?.invoiceFooter || "Thank You For Your Business!"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrintTemplate;
