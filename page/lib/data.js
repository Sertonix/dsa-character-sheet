export class DataManager {
  data = Object.create(null);
  redirects = Object.create(null);
  observer = Object.create(null);
  
  setAll(data) {
    for (const name in data) {
      this.set(name,data[name]);
    }
  }
  
  getAll() {
    const data = Object.create(null);
    Object.assign(data,this.data);
    for (const name in this.redirects) {
      const value = this.redirects[name]?.get();
      if (value == null) continue;
      data[name] = value;
    }
    return data;
  }

  get(name) {
    if (this.redirects[name]) {
      if (!this.redirects[name].get) throw new Error(`data redirector for ${JSON.stringify(name)} doesn't allow getting`);
      return this.redirects[name].get();
    }
    return this.data[name];
  }

  set(name,value) {
    if (this.redirects[name]) {
      if (!this.redirects[name].set) throw new Error(`data redirector for ${JSON.stringify(name)} doesn't allow setting`);
      this.redirects[name].set(value);
      return;
    }
    const oldValue = this.data[name];
    if (value === oldValue) return; // TODO matching of arrays and objects
    if (value != null) {
      this.data[name] = value;
    } else {
      delete this.data[name];
    }
    this.triggerObserver(name,value,oldValue);
  }
  
  reset() {
    for (const name in this.data) {
      this.triggerObserver(name,undefined,this.data[name]);
      delete this.data[name];
    }
    for (const redirector of Object.values(this.redirects)) {
      redirector.set?.();
      redirector.reset?.();
    }
  }

  setRedirect(name,{get,set,reset,initialize}) {
    if (this.redirects[name]) throw new Error(`data redirect for ${JSON.stringify(name)} already exists`);
    if (initialize) {
      initialize(this.data[name]);
      delete this.data[name];
    } else if (this.data[name] != null) {
      if (!set) throw new Error(`value for data ${JSON.stringify(name)} already set but redirector doesn't allow setting`);
      set(this.data[name]);
      delete this.data[name];
    }
    return this.redirects[name] = { get, set, reset, initialize };
  }

  getRedirect(name) { return this.redirects[name]; }
  isRedirected(name) { return !!this.redirects[name]; }

  removeRedirect(name) {
    if (!this.redirects[name]) throw new Error(`removed redirector for ${JSON.stringify(name)} that doesn't exists`);
    delete this.redirects[name];
  }

  triggerObserver(name,newValue,oldValue) {
    const observer = this.observer[name];
    if (!observer) return;
    for (const cb of observer) {
      cb(newValue,oldValue);
    }
  }

  addObserver(name,callback) {
    (this.observer[name] ||= new Set()).add(callback);
    callback(this.get(name));
  }

  removeObserver(name,callback) {
    const foundObserver = this.observer[name]?.delete(callback);
    if (!foundObserver) throw new Error(`could not find observer for ${JSON.stringify(name)}`);
    if (!this.observer[name].size) delete this.observer[name];
  }
}
