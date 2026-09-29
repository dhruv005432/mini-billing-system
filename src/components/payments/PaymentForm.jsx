import { useState } from "react";

function PaymentForm({
  invoice,
  onSave,
  onCancel
}) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [error, setError] = useState("");

  const amountDue = Number(invoice.amountDue !== undefined ? invoice.amountDue : invoice.total || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (paymentAmount > amountDue) {
      setError(
        `Payment cannot be greater than outstanding amount ₹${amountDue.toFixed(2)}.`
      );
      return;
    }

    onSave({
      amount: paymentAmount,
      paymentMethod
    });
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0">
          <i className="bi bi-cash-coin me-2"></i>
          Record Payment
        </h5>
      </div>

      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="payment-info-box">
              <small>Invoice</small>
              <strong>{invoice.invoiceNumber}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="payment-info-box">
              <small>Customer</small>
              <strong>{invoice.customerName}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="payment-info-box">
              <small>Outstanding</small>
              <strong className="text-danger">
                ₹{amountDue.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Payment Amount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                max={amountDue}
                step="0.01"
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder="Enter payment amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-circle me-2"></i>
                Record Payment
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentForm;
