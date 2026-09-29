import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "../context";
import CustomerSelector from "../components/billing/CustomerSelector";
import ProductSelector from "../components/billing/ProductSelector";
import BillingTable from "../components/billing/BillingTable";
import BillSummary from "../components/billing/BillSummary";
import { calculateBillSummary, calculateItem } from "../utils/calculations";

function Billing() {
  const navigate = useNavigate();
  const { createInvoice, settings } = useBilling();

  const [customer, setCustomer] = useState({
    id: null,
    name: "",
    mobile: "",
    email: "",
    address: "",
    gstNumber: ""
  });

  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Cart operations
  const handleAddToCart = (newItem) => {
    setCart((prevCart) => {
      // Check if product already exists in cart with same GST
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === newItem.productId
      );

      if (existingIndex > -1) {
        // Update existing item quantity
        const updated = [...prevCart];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + newItem.quantity;
        const reCalc = calculateItem(
          existing.price,
          newQty,
          existing.discount,
          existing.gst
        );
        updated[existingIndex] = {
          ...existing,
          ...reCalc
        };
        return updated;
      }

      return [...prevCart, newItem];
    });
  };

  const handleUpdateQuantity = (index, newQty) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const item = updated[index];
      const reCalc = calculateItem(
        item.price,
        newQty,
        item.discount,
        item.gst
      );
      updated[index] = { ...item, ...reCalc };
      return updated;
    });
  };

  const handleUpdateDiscount = (index, newDiscount) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const item = updated[index];
      const reCalc = calculateItem(
        item.price,
        item.quantity,
        newDiscount,
        item.gst
      );
      updated[index] = { ...item, ...reCalc };
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && window.confirm("Are you sure you want to clear all items in the cart?")) {
      setCart([]);
    }
  };

  const handleResetBill = () => {
    if (window.confirm("Reset entire bill? This will clear customer and items.")) {
      setCustomer({
        id: null,
        name: "",
        mobile: "",
        email: "",
        address: "",
        gstNumber: ""
      });
      setCart([]);
      setPaymentStatus("Paid");
      setPaymentMethod("Cash");
      setNotes("");
    }
  };

  const summary = calculateBillSummary(cart);
  const canGenerate = cart.length > 0 && Boolean(customer.name.trim()) && Boolean(customer.mobile.trim());

  const handleGenerateInvoice = () => {
    if (!customer.name.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!customer.mobile.trim()) {
      alert("Please enter customer mobile number.");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one product to the invoice.");
      return;
    }

    const invoiceData = {
      customerId: customer.id || null,
      customerName: customer.name.trim(),
      customerMobile: customer.mobile.trim(),
      customerEmail: customer.email ? customer.email.trim() : "",
      customerAddress: customer.address ? customer.address.trim() : "",
      customerGst: customer.gstNumber ? customer.gstNumber.trim().toUpperCase() : "",
      items: cart,
      subtotal: summary.subtotal,
      discount: summary.discount,
      taxableAmount: summary.taxableAmount,
      cgst: summary.cgst,
      sgst: summary.sgst,
      gstTotal: summary.gstTotal,
      gstAmount: summary.gstTotal,
      total: summary.grandTotal,
      amountPaid: paymentStatus === "Paid" ? summary.grandTotal : 0,
      amountDue: paymentStatus === "Paid" ? 0 : summary.grandTotal,
      paymentStatus,
      paymentMethod,
      notes: notes.trim()
    };

    const created = createInvoice(invoiceData);
    setGeneratedInvoice(created);
    setShowSuccessModal(true);
  };

  const handleStartNewBill = () => {
    setShowSuccessModal(false);
    setGeneratedInvoice(null);
    setCustomer({
      id: null,
      name: "",
      mobile: "",
      email: "",
      address: "",
      gstNumber: ""
    });
    setCart([]);
    setNotes("");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>New Billing Invoice</h2>
          <p>
            Select customer, add products, adjust quantities/discounts, and generate GST invoice.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleResetBill}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reset All
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Customer Form, Product Selector, Billing Cart */}
        <div className="col-12 col-xl-8">
          <CustomerSelector customer={customer} setCustomer={setCustomer} />

          <ProductSelector onAddToCart={handleAddToCart} />

          <BillingTable
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateDiscount={handleUpdateDiscount}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />
        </div>

        {/* Right Column: Calculation Summary */}
        <div className="col-12 col-xl-4">
          <BillSummary
            summary={summary}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            notes={notes}
            setNotes={setNotes}
            onGenerateInvoice={handleGenerateInvoice}
            onResetBill={handleResetBill}
            canGenerate={canGenerate}
          />
        </div>
      </div>

      {/* Invoice Created Modal */}
      {showSuccessModal && generatedInvoice && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 text-center p-4">
              <div className="modal-body">
                <div
                  className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "65px", height: "65px", fontSize: "30px" }}
                >
                  <i className="bi bi-check-lg"></i>
                </div>
                <h4 className="fw-bold mb-1">Invoice Generated Successfully!</h4>
                <p className="text-muted mb-3">
                  Invoice Number: <strong>{generatedInvoice.invoiceNumber}</strong>
                </p>

                <div className="bg-light p-3 rounded text-start mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Customer:</span>
                    <strong>{generatedInvoice.customerName}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Total Items:</span>
                    <span>{generatedInvoice.items.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Grand Total:</span>
                    <strong className="text-primary">
                      {settings.currency}
                      {generatedInvoice.total}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Status:</span>
                    <span className="badge bg-success">{generatedInvoice.paymentStatus}</span>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/invoices/${generatedInvoice.id}`)}
                  >
                    <i className="bi bi-printer me-2"></i>
                    View & Print Invoice
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleStartNewBill}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Create Another Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
