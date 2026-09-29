import { getData, setData } from "./storage";

export const migrateInvoices = () => {
  const invoices = getData("invoices", []);
  if (!Array.isArray(invoices) || invoices.length === 0) return;

  let hasChanges = false;
  const migratedInvoices = invoices.map((invoice) => {
    // If already fully migrated with Phase 7 fields, keep as is
    if (
      invoice.amountPaid !== undefined &&
      invoice.amountDue !== undefined &&
      Array.isArray(invoice.paymentHistory)
    ) {
      return invoice;
    }

    hasChanges = true;
    const total = Number(invoice.total || 0);
    let amountPaid = Number(invoice.amountPaid || 0);

    if (invoice.paymentStatus === "Paid") {
      amountPaid = total;
    }

    const amountDue = Math.max(total - amountPaid, 0);

    return {
      ...invoice,
      amountPaid,
      amountDue,
      paymentHistory:
        Array.isArray(invoice.paymentHistory) && invoice.paymentHistory.length > 0
          ? invoice.paymentHistory
          : amountPaid > 0
          ? [
              {
                id: Date.now() + (Number(invoice.id) || Math.floor(Math.random() * 1000)),
                amount: amountPaid,
                paymentMethod: invoice.paymentMethod || "Cash",
                date: invoice.date || new Date().toISOString().split("T")[0]
              }
            ]
          : []
    };
  });

  if (hasChanges) {
    setData("invoices", migratedInvoices);
  }
};
