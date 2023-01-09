export class CommandManager {
  commands = Object.create(null);
  
  add(key,cb) {
    if (this.commands[key]) throw new Error(`command ${JSON.stringify(key)} already defined`);
    if (typeof cb !== "function") throw new Error("command callback has to be a function");
    this.commands[key] = cb;
  }
  
  get(key) { return this.commands[key] }
  
  trigger(key,...args) {
    if (!this.commands[key]) throw new Error(`command ${JSON.stringify(key)} is not defined`);
    this.commands[key](...args);
  }

  getKeys() {
    return Object.keys(this.commands);
  }
}
