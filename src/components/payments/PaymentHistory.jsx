function PaymentHistory({ invoice }) {
  const history = invoice?.paymentHistory || [];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Payment History
        </h5>
      </div>

      <div className="card-body p-0">
        {history.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-cash-stack fs-1 text-muted"></i>
            <h6 className="mt-3 text-muted">No payments recorded yet</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.map((payment, index) => (
                  <tr key={payment.id || index}>
                    <td>{index + 1}</td>
                    <td>{payment.date || "-"}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {payment.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td className="text-end">
                      <strong className="text-success">
                        ₹{Number(payment.amount || 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
