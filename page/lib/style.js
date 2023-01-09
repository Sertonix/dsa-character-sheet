export class StyleManager {
  styles = new Set();
  element = document.createElement("dsa-style-manager");
  
  constructor() {
    this.element.style.setProperty("display","none");
  }

  add(uri) {
    const element = document.createElement("link");
    element.setAttribute("rel","styleSheet");
    element.setAttribute("href",uri);
    this.element.append(element);
    this.styles.add(element);
    return element;
  }

  remove(style) {
    this.styles.delete(style);
    style.remove();
  }
}
