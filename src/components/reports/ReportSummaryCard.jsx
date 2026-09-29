const ReportSummaryCard = ({
  title,
  value,
  icon,
  iconColor = "primary",
  subtitle
}) => {
  return (
    <div className="col-xl-3 col-md-6 mb-4">
      <div className="card border-0 shadow-sm h-100 report-summary-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="text-muted mb-2">{title}</p>
              <h4 className="fw-bold mb-2">{value}</h4>
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>

            <div
              className={`report-icon bg-${iconColor}-subtle text-${iconColor}`}
            >
              <i className={`bi ${icon}`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryCard;
