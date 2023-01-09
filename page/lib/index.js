import {Character} from "./character.js";

const dsa = window.dsa = new Character();
document.body.append(dsa.element.main);
dsa.initialize();
