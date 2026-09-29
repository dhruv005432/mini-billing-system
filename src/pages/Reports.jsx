import { useMemo, useState } from "react";
import ReportSummaryCard from "../components/reports/ReportSummaryCard";
import SalesReportTable from "../components/reports/SalesReportTable";
import ProductSalesTable from "../components/reports/ProductSalesTable";
import CustomerSalesTable from "../components/reports/CustomerSalesTable";
import { useBilling } from "../context";
import {
  formatCurrency,
  calculateInvoiceReport,
  getDailySalesReport,
  getMonthlySalesReport,
  getProductSalesReport,
  getCustomerSalesReport,
  downloadCSV
} from "../utils/reportUtils";

const Reports = () => {
  const { invoices } = useBilling();

  const [activeReport, setActiveReport] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((invoice) => {
      const invoiceDate = invoice.date ? (String(invoice.date).includes("T") ? invoice.date.split("T")[0] : invoice.date) : "";

      const matchesStartDate = !startDate || invoiceDate >= startDate;
      const matchesEndDate = !endDate || invoiceDate <= endDate;

      const total = Number(invoice.total || 0);
      const amountPaid = Number(invoice.amountPaid !== undefined ? invoice.amountPaid : (invoice.paymentStatus === "Paid" ? total : 0));

      let status = invoice.paymentStatus || "Pending";
      if (!invoice.paymentStatus) {
        if (amountPaid >= total && total > 0) {
          status = "Paid";
        } else if (amountPaid > 0) {
          status = "Partial";
        }
      }

      const matchesPayment = paymentFilter === "All" || paymentFilter === status;

      return matchesStartDate && matchesEndDate && matchesPayment;
    });
  }, [invoices, startDate, endDate, paymentFilter]);

  const summary = useMemo(() => {
    return calculateInvoiceReport(filteredInvoices);
  }, [filteredInvoices]);

  const dailyReport = useMemo(() => {
    return getDailySalesReport(filteredInvoices);
  }, [filteredInvoices]);

  const monthlyReport = useMemo(() => {
    return getMonthlySalesReport(filteredInvoices);
  }, [filteredInvoices]);

  const productReport = useMemo(() => {
    return getProductSalesReport(filteredInvoices);
  }, [filteredInvoices]);

  const customerReport = useMemo(() => {
    return getCustomerSalesReport(filteredInvoices);
  }, [filteredInvoices]);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setPaymentFilter("All");
  };

  const exportCurrentReport = () => {
    if (activeReport === "daily") {
      downloadCSV("daily-sales-report.csv", dailyReport);
      return;
    }

    if (activeReport === "monthly") {
      downloadCSV("monthly-sales-report.csv", monthlyReport);
      return;
    }

    if (activeReport === "products") {
      downloadCSV("product-sales-report.csv", productReport);
      return;
    }

    if (activeReport === "customers") {
      downloadCSV("customer-sales-report.csv", customerReport);
    }
  };

  const exportInvoiceSummary = () => {
    const rows = filteredInvoices.map((invoice) => ({
      Invoice: invoice.invoiceNumber || invoice.id,
      Date: invoice.date || "",
      Customer: invoice.customerName || "",
      Total: Number(invoice.total || 0),
      Paid: Number(invoice.amountPaid !== undefined ? invoice.amountPaid : (invoice.paymentStatus === "Paid" ? invoice.total : 0)),
      Outstanding: Number(
        invoice.amountDue !== undefined
          ? invoice.amountDue
          : Math.max(
              Number(invoice.total || 0) -
                Number(invoice.amountPaid || (invoice.paymentStatus === "Paid" ? invoice.total : 0)),
              0
            )
      ),
      Status: invoice.paymentStatus || "Pending"
    }));

    downloadCSV("invoice-summary-report.csv", rows);
  };

  return (
    <div className="container-fluid py-2">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 no-print">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
            Reports & Analytics
          </h2>
          <p className="text-muted mb-0">
            Monitor sales, GST liability, payments, and business performance metrics.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-success"
            onClick={exportCurrentReport}
          >
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Export CSV
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={exportInvoiceSummary}
          >
            <i className="bi bi-download me-2"></i>
            Invoice CSV
          </button>

          <button
            className="btn btn-dark"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i>
            Print Report
          </button>
        </div>
      </div>

      {/* Date & Status Filters */}
      <div className="card border-0 shadow-sm mb-4 no-print">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold">Payment Status</label>
              <select
                className="form-select"
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="col-lg-3 col-md-6">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Summary KPI Cards */}
      <div className="row">
        <ReportSummaryCard
          title="Total Sales"
          value={formatCurrency(summary.totalSales)}
          icon="bi-currency-rupee"
          iconColor="primary"
          subtitle={`${summary.invoiceCount} invoices`}
        />

        <ReportSummaryCard
          title="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          icon="bi-wallet2"
          iconColor="success"
          subtitle="Received payments"
        />

        <ReportSummaryCard
          title="Outstanding"
          value={formatCurrency(summary.totalOutstanding)}
          icon="bi-clock-history"
          iconColor="danger"
          subtitle="Remaining amount"
        />

        <ReportSummaryCard
          title="Total GST"
          value={formatCurrency(summary.totalGST)}
          icon="bi-receipt"
          iconColor="warning"
          subtitle="CGST + SGST"
        />
      </div>

      {/* 4 Secondary Payment Status KPI Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Paid Invoices</small>
              <h4 className="fw-bold text-success mt-2">
                {summary.paidInvoices}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Partial Invoices</small>
              <h4 className="fw-bold text-warning mt-2">
                {summary.partialInvoices}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Pending Invoices</small>
              <h4 className="fw-bold text-danger mt-2">
                {summary.pendingInvoices}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Total Discount</small>
              <h4 className="fw-bold mt-2">
                {formatCurrency(summary.totalDiscount)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* GST Summary Box */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-receipt-cutoff me-2"></i>
            GST Summary Breakdown
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="gst-report-box">
                <small>Taxable Amount</small>
                <h5>{formatCurrency(summary.totalTaxableAmount)}</h5>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gst-report-box">
                <small>CGST</small>
                <h5>{formatCurrency(summary.totalCGST)}</h5>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gst-report-box">
                <small>SGST</small>
                <h5>{formatCurrency(summary.totalSGST)}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="card border-0 shadow-sm mb-4 no-print">
        <div className="card-body">
          <div className="report-tabs">
            <button
              className={
                activeReport === "daily"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => setActiveReport("daily")}
            >
              <i className="bi bi-calendar-day me-2"></i>
              Daily Sales
            </button>

            <button
              className={
                activeReport === "monthly"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => setActiveReport("monthly")}
            >
              <i className="bi bi-calendar-month me-2"></i>
              Monthly Sales
            </button>

            <button
              className={
                activeReport === "products"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => setActiveReport("products")}
            >
              <i className="bi bi-box-seam me-2"></i>
              Products
            </button>

            <button
              className={
                activeReport === "customers"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => setActiveReport("customers")}
            >
              <i className="bi bi-people me-2"></i>
              Customers
            </button>
          </div>
        </div>
      </div>

      {/* Active Tab Report View */}
      {activeReport === "daily" && (
        <SalesReportTable
          title="Daily Sales Report"
          data={dailyReport}
          type="daily"
        />
      )}

      {activeReport === "monthly" && (
        <SalesReportTable
          title="Monthly Sales Report"
          data={monthlyReport}
          type="monthly"
        />
      )}

      {activeReport === "products" && (
        <ProductSalesTable data={productReport} />
      )}

      {activeReport === "customers" && (
        <CustomerSalesTable data={customerReport} />
      )}
    </div>
  );
};

export default Reports;
