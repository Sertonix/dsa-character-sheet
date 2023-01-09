const fs = require("node:fs");
const path = require("node:path");
const importRegexp = /^import (.+?) from ".\/([a-zA-Z\-_]*?.js)";$/gm;

function readFilesInDir(dir) {
  const files = {};
  for (const fileName of fs.readdirSync(dir)) {
    files[fileName] = fs.readFileSync(path.join(dir,fileName),{encoding:"utf8"});
  }
  return files;
}

function orderJsFiles(files) {
  const sortedFiles = [];
  let unsortedFiles = Object.entries(files);
  
  while (unsortedFiles.length) {
    const lengthBefore = unsortedFiles.length;
    unsortedFiles = unsortedFiles.filter( ([name,content]) => {
      if ([...content.matchAll(importRegexp)].some( importMatch =>
        sortedFiles.findIndex( ([n]) => n === importMatch[2] ) === -1
      )) return true;
      sortedFiles.push([name,content]);
    });
    if (lengthBefore === unsortedFiles.length) throw new Error(`circular reference ${unsortedLibFiles.map( ([n]) => n )}`);
  }
  
  return sortedFiles;
}

function genFileAdder([name,content]) {
  return `addFile("${name}", genImports\`${
    content
      .replace( /[\\`]|\$(?={)/g, "\\$&" )
      .replace( importRegexp, "import $1 from \"${\"$2\"}\";" ) // TODO restrict matching to prevent false positives.
  }\`);`
}

function bundleJs(dir) {
  const files = orderJsFiles(readFilesInDir(dir));
  const bundledJs = `\
  (()=>{
  const objectURLs = Object.create(null);
  
  function addFile(name, src) {
    const blob = new Blob(src, {type:"text/javascript"});
    objectURLs[name] = URL.createObjectURL(blob) + "#./" + name;
  }
  
  function genImports(strings,...imports) {
    return strings.map( (str,i) =>
      imports.length === i ? str : str + objectURLs[imports[i]]
    );
  }
  
  ${files.map(genFileAdder).join("\n")}
  
  import(objectURLs["index.js"]);
  }();`;
  
  if (["<!--","<script","</script"].some( s => bundledJs.includes(s) )) {
    throw new Error("can't bundle. please remove any occurences of \"<!--\", \"<script\" or \"</script\"");
  }
  
  return bundledJs;
}

function bundle(jsDir,htmlPath,faviconPath,outPath) {
  let htmlContent = fs.readFileSync(htmlPath,{encoding:"utf8"});
  
  const favicon = fs.readFileSync(faviconPath,{encoding:"utf8"});
  htmlContent = htmlContent.replace("./favicon.svg", "data:image/svg+xml," + encodeURIComponent(favicon) );
  
  htmlContent = htmlContent.replace(
    "<script src=\"./lib/index.js\" type=\"module\"></script>",
    () => `<script>${bundleJs(jsDir)}</script>`,
  );
  
  fs.writeFileSync(outPath,htmlContent);
}

bundle(
  path.join(__dirname,"page","lib"),
  path.join(__dirname,"page","sheet.html"),
  path.join(__dirname,"page","favicon.svg"),
  path.join(__dirname,"sheet-bundled.html"),
);
