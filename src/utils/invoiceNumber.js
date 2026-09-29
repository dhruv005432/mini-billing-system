// Invoice numbering helper

export const generateNextInvoiceNumber = (invoices = [], prefix = "INV", startNum = 1001) => {
  if (!invoices || invoices.length === 0) {
    return `${prefix}-${startNum}`;
  }

  // Find the highest sequence number from existing invoices
  const numbers = invoices.map((inv) => {
    if (!inv.invoiceNumber) return 0;
    const parts = inv.invoiceNumber.split("-");
    const numPart = parseInt(parts[parts.length - 1], 10);
    return isNaN(numPart) ? 0 : numPart;
  });

  const maxNum = Math.max(...numbers, startNum - 1);
  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum}`;
};
