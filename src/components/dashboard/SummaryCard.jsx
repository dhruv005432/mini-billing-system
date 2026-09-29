function SummaryCard({
  title,
  value,
  icon,
  description,
  trend,
  color = "primary"
}) {
  return (
    <div className="col-12 col-sm-6 col-xl-3 mb-4">
      <div className={`summary-card card-border-${color}`}>
        <div className="summary-card-top">
          <div>
            <p className="summary-title">{title}</p>
            <h3 className="summary-value">{value}</h3>
          </div>
          <div className={`summary-icon icon-${color}`}>
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
        <div className="summary-description">
          {trend && (
            <span className="badge bg-success-subtle text-success me-1">
              <i className="bi bi-arrow-up-short"></i>
              {trend}
            </span>
          )}
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
