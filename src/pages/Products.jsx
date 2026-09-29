import { useState } from "react";
import { useBilling } from "../context";
import { formatCurrency } from "../utils/calculations";

function Products() {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialForm = {
    name: "",
    sku: "",
    category: "General",
    price: "",
    purchasePrice: "",
    gst: 18,
    stock: 10,
    minStock: 5,
    description: ""
  };

  const [form, setForm] = useState(initialForm);

  // Categories list
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setIsEditing(true);
    setCurrentId(prod.id);
    setForm({
      name: prod.name || "",
      sku: prod.sku || "",
      category: prod.category || "General",
      price: prod.price || "",
      purchasePrice: prod.purchasePrice || "",
      gst: prod.gst ?? 18,
      stock: prod.stock ?? 0,
      minStock: prod.minStock ?? 5,
      description: prod.description || ""
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      alert("Product Name and Selling Price are required.");
      return;
    }

    if (isEditing) {
      updateProduct(currentId, form);
    } else {
      addProduct(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Product Management</h2>
          <p>Manage product catalog, inventory stock levels, and GST rates.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search products by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2">
              <label className="text-muted small fw-semibold text-nowrap">Category:</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 col-md-2 text-md-end text-muted small">
            Showing <strong>{filteredProducts.length}</strong> of {products.length}
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>Purchase Price</th>
                  <th>GST Rate</th>
                  <th>Stock</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const isLowStock = p.stock <= 5;
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          {p.description && (
                            <small className="text-muted d-block">{p.description}</small>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border">
                            {p.sku || "N/A"}
                          </span>
                        </td>
                        <td>{p.category || "General"}</td>
                        <td className="fw-bold text-dark">
                          {formatCurrency(p.price, settings.currency)}
                        </td>
                        <td className="text-muted">
                          {p.purchasePrice
                            ? formatCurrency(p.purchasePrice, settings.currency)
                            : "-"}
                        </td>
                        <td>
                          <span className="badge bg-info-subtle text-info-emphasis">
                            {p.gst}%
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              p.stock === 0
                                ? "bg-danger"
                                : isLowStock
                                ? "bg-warning text-dark"
                                : "bg-success-subtle text-success"
                            }`}
                          >
                            {p.stock} units
                            {isLowStock && p.stock > 0 && " (Low)"}
                            {p.stock === 0 && " (Out)"}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit Product"
                            onClick={() => openEditModal(p)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Product"
                            onClick={() => handleDelete(p.id, p.name)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-box fs-1 d-block mb-2"></i>
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Product Information" : "Add New Product"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Cotton T-Shirt"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">SKU / Item Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        placeholder="e.g. TS001"
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="e.g. Clothes, Shoes"
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">
                        Selling Price ({settings.currency}) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">
                        Purchase Price ({settings.currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={form.purchasePrice}
                        onChange={(e) =>
                          setForm({ ...form, purchasePrice: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">GST Rate (%) *</label>
                      <select
                        className="form-select"
                        value={form.gst}
                        onChange={(e) => setForm({ ...form, gst: Number(e.target.value) })}
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={form.stock}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            stock: Math.max(0, parseInt(e.target.value, 10) || 0)
                          })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        placeholder="Optional details, size, fabric, or model..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditing ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
