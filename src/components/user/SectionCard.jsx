function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-[#DDE3EA] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#163B6D]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

export default SectionCard;
