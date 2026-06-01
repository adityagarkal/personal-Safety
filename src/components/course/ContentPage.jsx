function ContentPage({ page }) {
  if (!page) return null;

  const texts = page.texts?.txt || [];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-8">
        {page.title}
      </h1>

      <div className="space-y-6">
        {texts.map((text, index) => (
          <div
            key={index}
            className="flex items-start gap-3"
          >
            <span className="text-blue-600 font-bold">
              •
            </span>

            <p className="text-lg leading-relaxed">
              {text["#text"]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentPage;