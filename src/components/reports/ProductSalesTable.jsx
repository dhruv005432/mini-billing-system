import { formatCurrency } from "../../utils/reportUtils";

const ProductSalesTable = ({ data = [] }) => {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-box-seam me-2"></i>
          Product Sales Report
        </h5>
      </div>

      <div className="card-body p-0">
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
            No product sales data available.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Invoices</th>
                  <th>Total Sales</th>
                </tr>
              </thead>

              <tbody>
                {data.map((product, index) => (
                  <tr key={product.id || index}>
                    <td>{index + 1}</td>

                    <td className="fw-semibold">
                      {product.name}
                    </td>

                    <td>{product.quantity}</td>

                    <td>{product.invoiceCount}</td>

                    <td className="fw-semibold text-success">
                      {formatCurrency(product.sales)}
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

export default ProductSalesTable;
