import { formatCurrency } from "../../utils/reportUtils";

const CustomerSalesTable = ({ data = [] }) => {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-people me-2"></i>
          Customer Sales Report
        </h5>
      </div>

      <div className="card-body p-0">
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-people fs-1 d-block mb-2"></i>
            No customer sales data available.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Invoices</th>
                  <th>Sales</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                </tr>
              </thead>

              <tbody>
                {data.map((customer, index) => (
                  <tr key={customer.id || index}>
                    <td>{index + 1}</td>

                    <td className="fw-semibold">
                      {customer.name}
                    </td>

                    <td>{customer.mobile}</td>

                    <td>{customer.invoiceCount}</td>

                    <td className="fw-semibold">
                      {formatCurrency(customer.sales)}
                    </td>

                    <td className="text-success">
                      {formatCurrency(customer.collected)}
                    </td>

                    <td className="text-danger">
                      {formatCurrency(customer.outstanding)}
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

export default CustomerSalesTable;
