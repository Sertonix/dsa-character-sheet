class ToolBar {
  element = document.createElement("dsa-tool-bar");
  
  constructor() {
    dsa.element.bottom.append(this.element);
  }
}

new ToolBar();

export default {styleURI: "./index.css"};
