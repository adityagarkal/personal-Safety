function StatCard({ title, value, subtitle, icon, variant = "primary" }) {
  const variants = {
    primary: "bg-[#163B6D] text-white",
    secondary: "bg-[#2554C7] text-white",
    success: "bg-[#22C55E] text-white",
    warning: "bg-[#F59E0B] text-white",
  };

  return (
    <div className="rounded-2xl border border-[#DDE3EA] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <h2 className="mt-3 text-3xl font-bold text-[#163B6D]">{value}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            variants[variant] || variants.primary
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
