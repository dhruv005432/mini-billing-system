export const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (date) => {
  if (!date) return "-";

  // Handle both YYYY-MM-DD and full ISO strings
  const dateStr = String(date).includes("T") ? date.split("T")[0] : date;
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const getInvoicePaymentStatus = (invoice) => {
  const total = Number(invoice.total || 0);
  const amountPaid = Number(invoice.amountPaid || 0);

  if (amountPaid >= total && total > 0) {
    return "Paid";
  }

  if (amountPaid > 0) {
    return "Partial";
  }

  return "Pending";
};

export const calculateInvoiceReport = (invoices = []) => {
  return invoices.reduce(
    (summary, invoice) => {
      const total = Number(invoice.total || 0);
      const amountPaid = Number(invoice.amountPaid || 0);
      const amountDue =
        invoice.amountDue !== undefined
          ? Number(invoice.amountDue || 0)
          : Math.max(total - amountPaid, 0);

      summary.totalSales += total;
      summary.totalCollected += amountPaid;
      summary.totalOutstanding += amountDue;
      summary.totalSubtotal += Number(invoice.subtotal || 0);
      summary.totalDiscount += Number(invoice.discount || 0);
      summary.totalTaxableAmount += Number(invoice.taxableAmount || 0);
      summary.totalGST += Number(invoice.gstAmount || invoice.gstTotal || 0);
      summary.totalCGST += Number(invoice.cgst || 0);
      summary.totalSGST += Number(invoice.sgst || 0);
      summary.invoiceCount += 1;

      const status = invoice.paymentStatus || getInvoicePaymentStatus(invoice);

      if (status === "Paid") {
        summary.paidInvoices += 1;
      } else if (status === "Partial") {
        summary.partialInvoices += 1;
      } else {
        summary.pendingInvoices += 1;
      }

      return summary;
    },
    {
      totalSales: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      totalSubtotal: 0,
      totalDiscount: 0,
      totalTaxableAmount: 0,
      totalGST: 0,
      totalCGST: 0,
      totalSGST: 0,
      invoiceCount: 0,
      paidInvoices: 0,
      partialInvoices: 0,
      pendingInvoices: 0
    }
  );
};

export const getDailySalesReport = (invoices = []) => {
  const dailySales = {};

  invoices.forEach((invoice) => {
    const rawDate = invoice.date ? (String(invoice.date).includes("T") ? invoice.date.split("T")[0] : invoice.date) : "Unknown";

    if (!dailySales[rawDate]) {
      dailySales[rawDate] = {
        date: rawDate,
        invoiceCount: 0,
        sales: 0,
        collected: 0,
        outstanding: 0
      };
    }

    const total = Number(invoice.total || 0);
    const amountPaid = Number(invoice.amountPaid || 0);
    const amountDue =
      invoice.amountDue !== undefined
        ? Number(invoice.amountDue || 0)
        : Math.max(total - amountPaid, 0);

    dailySales[rawDate].invoiceCount += 1;
    dailySales[rawDate].sales += total;
    dailySales[rawDate].collected += amountPaid;
    dailySales[rawDate].outstanding += amountDue;
  });

  return Object.values(dailySales).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
};

export const getMonthlySalesReport = (invoices = []) => {
  const monthlySales = {};

  invoices.forEach((invoice) => {
    if (!invoice.date) return;

    const rawDate = String(invoice.date).includes("T") ? invoice.date.split("T")[0] : invoice.date;
    const month = rawDate.substring(0, 7);

    if (!monthlySales[month]) {
      monthlySales[month] = {
        month,
        invoiceCount: 0,
        sales: 0,
        collected: 0,
        outstanding: 0
      };
    }

    const total = Number(invoice.total || 0);
    const amountPaid = Number(invoice.amountPaid || 0);
    const amountDue =
      invoice.amountDue !== undefined
        ? Number(invoice.amountDue || 0)
        : Math.max(total - amountPaid, 0);

    monthlySales[month].invoiceCount += 1;
    monthlySales[month].sales += total;
    monthlySales[month].collected += amountPaid;
    monthlySales[month].outstanding += amountDue;
  });

  return Object.values(monthlySales)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((item) => {
      let monthLabel;
      try {
        monthLabel = new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric"
        });
      } catch {
        monthLabel = item.month;
      }
      return {
        ...item,
        monthLabel
      };
    });
};

export const getProductSalesReport = (invoices = []) => {
  const products = {};

  invoices.forEach((invoice) => {
    const items = invoice.items || [];

    items.forEach((item) => {
      const productId = item.productId || item.id;
      const productName = item.name || item.productName || "Unknown Product";
      const key = productId || productName;

      if (!products[key]) {
        products[key] = {
          id: key,
          name: productName,
          quantity: 0,
          sales: 0,
          invoiceCount: 0
        };
      }

      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const itemTotal = Number(item.total || item.subtotal || 0) || price * quantity;

      products[key].quantity += quantity;
      products[key].sales += itemTotal;
      products[key].invoiceCount += 1;
    });
  });

  return Object.values(products).sort(
    (a, b) => b.sales - a.sales
  );
};

export const getCustomerSalesReport = (invoices = []) => {
  const customers = {};

  invoices.forEach((invoice) => {
    const customerId =
      invoice.customerId || invoice.customerName || "Walk-in Customer";

    const customerName = invoice.customerName || "Walk-in Customer";

    if (!customers[customerId]) {
      customers[customerId] = {
        id: customerId,
        name: customerName,
        mobile: invoice.customerMobile || "-",
        invoiceCount: 0,
        sales: 0,
        collected: 0,
        outstanding: 0
      };
    }

    const total = Number(invoice.total || 0);
    const amountPaid = Number(invoice.amountPaid || 0);
    const amountDue =
      invoice.amountDue !== undefined
        ? Number(invoice.amountDue || 0)
        : Math.max(total - amountPaid, 0);

    customers[customerId].invoiceCount += 1;
    customers[customerId].sales += total;
    customers[customerId].collected += amountPaid;
    customers[customerId].outstanding += amountDue;
  });

  return Object.values(customers).sort(
    (a, b) => b.sales - a.sales
  );
};

export const downloadCSV = (fileName, rows) => {
  if (!rows || rows.length === 0) {
    alert("No report data available.");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const escapedValue = String(value).replace(/"/g, '""');
          return `"${escapedValue}"`;
        })
        .join(",")
    )
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
