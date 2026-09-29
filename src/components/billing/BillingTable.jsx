import { useBilling } from "../../context";
import { formatCurrency } from "../../utils/calculations";

function BillingTable({ cart, onUpdateQuantity, onUpdateDiscount, onRemoveItem, onClearCart }) {
  const { settings } = useBilling();

  if (cart.length === 0) {
    return (
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 text-primary">
            <i className="bi bi-cart3 me-2"></i>
            Invoice Items
          </h5>
        </div>
        <div className="card-body text-center py-5">
          <div className="empty-icon mb-3">
            <i className="bi bi-cart-x fs-1 text-muted"></i>
          </div>
          <h6 className="text-secondary">Your billing cart is currently empty</h6>
          <p className="text-muted small mb-0">
            Use the product selector above to add items to this invoice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">
          <i className="bi bi-cart-check me-2"></i>
          Invoice Items ({cart.length})
        </h5>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onClearCart}
        >
          <i className="bi bi-trash me-1"></i>
          Clear Cart
        </button>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "25%" }}>Product</th>
                <th style={{ width: "12%" }}>Price</th>
                <th style={{ width: "15%" }}>Qty</th>
                <th style={{ width: "10%" }}>GST %</th>
                <th style={{ width: "13%" }}>Discount</th>
                <th style={{ width: "12%" }} className="text-end">Total</th>
                <th style={{ width: "8%" }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={`${item.productId}-${index}`}>
                  <td className="text-muted">{index + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.sku && (
                      <span className="badge bg-light text-secondary ms-2">
                        {item.sku}
                      </span>
                    )}
                  </td>
                  <td>{formatCurrency(item.price, settings.currency)}</td>
                  <td>
                    <div className="input-group input-group-sm" style={{ maxWidth: "110px" }}>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm text-center px-1"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(
                            index,
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        }
                      />
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-info-subtle text-info-emphasis">
                      {item.gst}%
                    </span>
                  </td>
                  <td>
                    <div className="input-group input-group-sm" style={{ maxWidth: "100px" }}>
                      <span className="input-group-text py-0 px-1">{settings.currency}</span>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm text-end px-1"
                        value={item.discount}
                        onChange={(e) =>
                          onUpdateDiscount(
                            index,
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                      />
                    </div>
                  </td>
                  <td className="text-end fw-bold text-dark">
                    {formatCurrency(item.total, settings.currency)}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger border-0"
                      title="Remove item"
                      onClick={() => onRemoveItem(index)}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
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

export default BillingTable;
