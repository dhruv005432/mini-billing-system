import { useState } from "react";
import { useBilling } from "../../context";
import { calculateItem, formatCurrency } from "../../utils/calculations";

function ProductSelector({ onAddToCart }) {
  const { products, settings } = useBilling();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState(5);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  const handleProductChange = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);

    if (!id) {
      setPrice("");
      setGstRate(5);
      setQuantity(1);
      setDiscount(0);
      return;
    }

    const prod = products.find((p) => p.id === Number(id));
    if (prod) {
      setPrice(prod.price);
      setGstRate(prod.gst);
      setQuantity(1);
      setDiscount(0);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Live item calculation preview
  const preview = calculateItem(price, quantity, discount, gstRate);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Please select a product first.");
      return;
    }

    if (quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (preview.subtotal < discount) {
      alert("Discount cannot exceed item subtotal.");
      return;
    }

    onAddToCart({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      sku: selectedProduct.sku || "",
      price: Number(price),
      quantity: Number(quantity),
      discount: Number(discount) || 0,
      gst: Number(gstRate),
      subtotal: preview.subtotal,
      taxable: preview.taxable,
      gstAmount: preview.gstAmount,
      cgst: preview.cgst,
      sgst: preview.sgst,
      total: preview.total
    });

    // Reset selection for next item
    setSelectedProductId("");
    setPrice("");
    setQuantity(1);
    setDiscount(0);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 text-primary">
          <i className="bi bi-cart-plus me-2"></i>
          Select & Add Products
        </h5>
      </div>

      <div className="card-body">
        <form onSubmit={handleAdd}>
          <div className="row g-3 align-items-end">
            {/* Product selection */}
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">
                Product <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={handleProductChange}
                required
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="col-6 col-md-2">
              <label className="form-label fw-semibold">
                Price ({settings.currency || "₹"})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* GST Rate */}
            <div className="col-6 col-md-2">
              <label className="form-label fw-semibold">GST Rate (%)</label>
              <select
                className="form-select"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>

            {/* Quantity with +/- stepper */}
            <div className="col-6 col-md-2">
              <label className="form-label fw-semibold">Quantity</label>
              <div className="input-group">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  className="form-control text-center px-1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Discount */}
            <div className="col-6 col-md-1">
              <label className="form-label fw-semibold">Discount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
              />
            </div>

            {/* Add Button */}
            <div className="col-12 col-md-2">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={!selectedProductId}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Add Product
              </button>
            </div>
          </div>

          {/* Live item calculation preview banner */}
          {selectedProduct && (
            <div className="mt-3 p-2 px-3 bg-light rounded d-flex flex-wrap justify-content-between align-items-center text-muted small border">
              <div>
                <strong>Calculation: </strong>
                Subtotal: {formatCurrency(preview.subtotal, settings.currency)} - Discount: {formatCurrency(preview.discount, settings.currency)} = Taxable: {formatCurrency(preview.taxable, settings.currency)}
              </div>
              <div className="fw-bold text-primary">
                Item Total (+{preview.gst}% GST): {formatCurrency(preview.total, settings.currency)}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProductSelector;
