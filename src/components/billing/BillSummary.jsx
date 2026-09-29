import { useBilling } from "../../context";
import { formatCurrency } from "../../utils/calculations";

function BillSummary({
  summary,
  paymentStatus,
  setPaymentStatus,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes,
  onGenerateInvoice,
  onResetBill,
  canGenerate
}) {
  const { settings } = useBilling();

  return (
    <div className="card shadow-sm border-0 mb-4 sticky-top" style={{ top: "90px" }}>
      <div className="card-header bg-primary text-white py-3">
        <h5 className="mb-0">
          <i className="bi bi-calculator me-2"></i>
          Bill Summary
        </h5>
      </div>

      <div className="card-body p-4">
        {/* Calculation Table */}
        <div className="bill-summary-list">
          <div className="d-flex justify-content-between py-2 border-bottom">
            <span className="text-muted">Subtotal:</span>
            <span className="fw-semibold">
              {formatCurrency(summary.subtotal, settings.currency)}
            </span>
          </div>

          <div className="d-flex justify-content-between py-2 border-bottom">
            <span className="text-muted">Total Discount:</span>
            <span className="text-danger fw-semibold">
              - {formatCurrency(summary.discount, settings.currency)}
            </span>
          </div>

          <div className="d-flex justify-content-between py-2 border-bottom">
            <span className="text-muted">Taxable Amount:</span>
            <span className="fw-semibold">
              {formatCurrency(summary.taxableAmount, settings.currency)}
            </span>
          </div>

          <div className="d-flex justify-content-between py-2 border-bottom">
            <span className="text-muted">CGST (Central Tax):</span>
            <span className="text-secondary fw-semibold">
              +{formatCurrency(summary.cgst, settings.currency)}
            </span>
          </div>

          <div className="d-flex justify-content-between py-2 border-bottom">
            <span className="text-muted">SGST (State Tax):</span>
            <span className="text-secondary fw-semibold">
              +{formatCurrency(summary.sgst, settings.currency)}
            </span>
          </div>

          <div className="d-flex justify-content-between py-3 border-bottom mt-2 bg-light px-2 rounded">
            <span className="h5 mb-0 fw-bold text-dark">Grand Total:</span>
            <span className="h4 mb-0 fw-bold text-primary">
              {formatCurrency(summary.grandTotal, settings.currency)}
            </span>
          </div>
        </div>

        {/* Payment & Status Options */}
        <div className="mt-4 pt-2 border-top">
          <h6 className="fw-bold mb-3 text-secondary">
            <i className="bi bi-wallet2 me-1"></i>
            Payment Information
          </h6>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small fw-semibold">Payment Status</label>
              <select
                className="form-select form-select-sm"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label small fw-semibold">Payment Method</label>
              <select
                className="form-select form-select-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / QR</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Invoice Notes / Terms</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Paid via Google Pay"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="d-grid gap-2 mt-4">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onGenerateInvoice}
            disabled={!canGenerate}
          >
            <i className="bi bi-file-earmark-check me-2"></i>
            Generate Invoice
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onResetBill}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reset Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillSummary;
