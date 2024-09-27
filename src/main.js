/** @typedef{import('./lang.js').Peripherals} Peripherals */

import { interpret, tokenize } from "./lang.js";
import * as samples from "./samples.js";

const programInputEl = document.getElementById("pgm");
const runButtonEl = document.getElementById("run");
const errorsEl = document.getElementById("errors");
const outputEl = document.getElementById("output");

/**
 * Create basic peripherals that interact with browser APIs.
 * @param {number} size
 * @returns {Peripherals}
 */
export function makePeripherals(size = 30_000) {
  const tape = new Uint8Array(size);
  let hp = 0;

  outputEl.innerText = "";
  return {
    stdio: {
      stdin: (function* () {
        const c = prompt();
        if (!c || !c.length) throw "EOF";
        yield c.charCodeAt(0);
      })(),
      stdout: (n) => (outputEl.innerText += String.fromCharCode(n)),
    },
    tape: {
      move: (x) => void (hp += x),
      read: () => tape[hp],
      write: (v) => void (tape[hp] = v),
    },
  };
}

runButtonEl.addEventListener("click", async () => {
  errorsEl.innerText = "";
  const program = programInputEl.value;
  const peripherals = makePeripherals();
  try {
    const instructions = tokenize(program);
    for (let ip of interpret(instructions, peripherals));
  } catch (e) {
    errorsEl.innerText += String(e) + "\n";
    console.error(e);
  }
});

programInputEl.value = samples.helloWorld;
