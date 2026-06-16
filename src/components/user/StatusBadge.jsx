function StatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();

  const styles = {
    completed: "bg-green-100 text-green-700",
    "in progress": "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    mandatory: "bg-[#163B6D] text-white",
    recommended: "bg-orange-100 text-orange-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[normalizedStatus] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

export default StatusBadge;
