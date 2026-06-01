import { useEffect, useState } from "react";
import { loadXML } from "../../services/xmlParser";
import ContentPage from "../../components/course/ContentPage";

function Home() {
  const [pages, setPages] = useState([]);
  const [language, setLanguage] = useState("EN");

  useEffect(() => {
    async function loadPage() {
      const data = await loadXML(
        "/content/001-Personal_Safety_2009/p_safety/1/1.xml"
      );

      setPages(data.pages.page);
    }

    loadPage();
  }, []);

  const selectedPage =
    pages.find(
      (page) => page["@_level"] === language
    ) || null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex gap-4 justify-center mb-8">

        <button
          onClick={() => setLanguage("EN")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          English
        </button>

        <button
          onClick={() => setLanguage("CH")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Chinese
        </button>

        <button
          onClick={() => setLanguage("RU")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Russian
        </button>

      </div>

      <ContentPage page={selectedPage} />
    </div>
  );
}

export default Home;