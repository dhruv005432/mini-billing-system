import {
  formatCurrency,
  formatDate
} from "../../utils/reportUtils";

const SalesReportTable = ({
  title,
  data = [],
  type = "daily"
}) => {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-bar-chart-line me-2"></i>
          {title}
        </h5>
      </div>

      <div className="card-body p-0">
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-bar-chart fs-1 d-block mb-2"></i>
            No sales data available.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>
                    {type === "monthly" ? "Month" : "Date"}
                  </th>
                  <th>Invoices</th>
                  <th>Sales</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr key={`${item.date || item.month || index}-${index}`}>
                    <td>
                      {type === "monthly"
                        ? item.monthLabel || item.month
                        : formatDate(item.date)}
                    </td>

                    <td>{item.invoiceCount}</td>

                    <td className="fw-semibold">
                      {formatCurrency(item.sales)}
                    </td>

                    <td className="text-success">
                      {formatCurrency(item.collected)}
                    </td>

                    <td className="text-danger">
                      {formatCurrency(item.outstanding)}
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
};

export default SalesReportTable;
