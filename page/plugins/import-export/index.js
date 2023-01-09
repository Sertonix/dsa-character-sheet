const CHARACTER_FILE_TYPES = "application/json,.dsa-char";
const DEFAULT_CHARACTER_FILE_ENDING = ".json";

dsa.commands.add("import-export:export", () => {
  const fileContent = JSON.stringify(dsa.data.getAll(),null,2);
  const blob = new Blob([fileContent]);
  const objectURI = URL.createObjectURL(blob);

  const tempLink = document.createElement("a");
  tempLink.setAttribute("href", objectURI);
  tempLink.setAttribute("download", `dsa-character${DEFAULT_CHARACTER_FILE_ENDING}`);
  tempLink.click();

  URL.revokeObjectURL(objectURI);
  tempLink.remove();
});

dsa.commands.add("import-export:import", () => {
  const tempInput = document.createElement("input");
  tempInput.setAttribute("type", "file");
  tempInput.setAttribute("multiple", "");
  tempInput.setAttribute("accept", CHARACTER_FILE_TYPES);
  tempInput.addEventListener("change", async () => {
    const file = tempInput.files[0];
    if (!file) return;
    const data = JSON.parse(await file.text(), (k,v) => v && typeof v === "object" && !Array.isArray(v) ? Object.assign(Object.create(null),v) : v);
    dsa.data.reset();
    dsa.data.setAll(data);
  }, {once:true,passive:true});
  tempInput.click();
});

export default {styleURI: "./index.css"};
