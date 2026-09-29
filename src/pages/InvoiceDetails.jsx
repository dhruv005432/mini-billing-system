import { useParams, useNavigate } from "react-router-dom";
import { useBilling } from "../context";
import InvoiceView from "../components/invoices/InvoiceView";

function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices } = useBilling();

  const invoice = invoices.find((inv) => inv.id === Number(id));

  if (!invoice) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-file-earmark-x fs-1 text-muted d-block mb-3"></i>
        <h3>Invoice Not Found</h3>
        <p className="text-muted">The requested invoice ID does not exist in the records.</p>
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="btn btn-primary"
        >
          Back to Invoice List
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-details-page py-2">
      <InvoiceView invoice={invoice} onClose={() => navigate("/invoices")} />
    </div>
  );
}

export default InvoiceDetails;
