class CommandPalette {
  element = {
    main: document.createElement("dsa-command-palette"),
    search: document.createElement("input"),
    commands: document.createElement("dsa-command-palette-list"),
  };
  commands = [];
  
  constructor() {
    this.element.main.append(
      this.element.search,
      this.element.commands,
    );
    this.element.search.classList.add("command-palette-search");
    this.element.search.setAttribute("contenteditable","true");
    this.element.search.addEventListener( "keypress", event => {
      if (event.key !== "Enter") return;
      this.handleConfirm();
    });
    dsa.element.main.append(this.element.main);
    this.update();
  }
  
  handleConfirm() {
    dsa.commands.trigger(this.element.search.value);
  }
  
  update() {
    dsa.commands.getKeys()
  }
  
  remove() {
    this.element.main.remove();
  }
}

let commandPalette;

dsa.commands.add("command-palette:open", () => commandPalette ||= new CommandPalette() );
dsa.commands.add("command-palette:close", () => {
  commandPalette.remove();
  commandPalette = null;
});

export default {styleURI:"./index.css"};
