const StatCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <p>{title}</p>

          <h2>{value}</h2>
        </div>

        <div className="stat-icon">
          <Icon size={21} />
        </div>
      </div>

      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  );
};

export default StatCard;
