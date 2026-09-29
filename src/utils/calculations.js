// Billing calculation utilities

export const calculateItem = (price, quantity, discount = 0, gstRate = 0) => {
  const p = Number(price) || 0;
  const q = Math.max(1, Number(quantity) || 1);
  const d = Math.max(0, Number(discount) || 0);
  const g = Number(gstRate) || 0;

  const subtotal = Number((p * q).toFixed(2));
  const effectiveDiscount = Math.min(subtotal, d);
  const taxable = Number((subtotal - effectiveDiscount).toFixed(2));
  const gstAmount = Number(((taxable * g) / 100).toFixed(2));
  const cgst = Number((gstAmount / 2).toFixed(2));
  const sgst = Number((gstAmount / 2).toFixed(2));
  const total = Number((taxable + gstAmount).toFixed(2));

  return {
    price: p,
    quantity: q,
    discount: effectiveDiscount,
    gst: g,
    subtotal,
    taxable,
    gstAmount,
    cgst,
    sgst,
    total
  };
};

export const calculateBillSummary = (items = []) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalGst = 0;
  let grandTotal = 0;

  items.forEach((item) => {
    const calc = calculateItem(item.price, item.quantity, item.discount, item.gst);
    subtotal += calc.subtotal;
    totalDiscount += calc.discount;
    taxableAmount += calc.taxable;
    totalGst += calc.gstAmount;
    grandTotal += calc.total;
  });

  const cgst = Number((totalGst / 2).toFixed(2));
  const sgst = Number((totalGst / 2).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(totalDiscount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    gstTotal: Number(totalGst.toFixed(2)),
    cgst,
    sgst,
    grandTotal: Number(grandTotal.toFixed(2)),
    itemCount: items.length,
    totalQty: items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)
  };
};

export const formatCurrency = (amount, currency = "₹") => {
  const num = Number(amount) || 0;
  return `${currency}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};
