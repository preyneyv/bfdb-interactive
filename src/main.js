/** @typedef{import('./lang.js').Peripherals} Peripherals */

import { ASCII } from "./ascii.js";
import { BF_INSTRUCTIONS_MAP, interpret, tokenize } from "./lang.js";
import * as samples from "./samples.js";

const programInputEl = document.getElementById("pgm");
const errorsEl = document.getElementById("errors");
const outputEl = document.getElementById("output");

const instructionsEl = document.getElementById("instructions");
const instructionPtrEl = document.getElementById("instruction-ptr");

const tapePtrEl = document.getElementById("tape-ptr");
const tapeEl = document.getElementById("tape");

/**
 * Create basic peripherals that interact with browser APIs.
 * @param {number} size
 * @returns {Peripherals}
 */
export function makePeripherals(size = 512) {
  const tape = new Uint8Array(size);
  const tapeHexEls = [];
  const tapeAsciiEls = [];
  tapeEl.innerHTML = "";
  for (let i = 0; i < size; i += 16) {
    const row = document.createElement("div");
    row.innerHTML = `<span>${fmtHex(i)} </span>`;
    const chars = [];
    for (let j = i; j < Math.min(i + 16, size); j++) {
      const cell = document.createElement("span");
      cell.innerText = "00";
      if (j === 0) cell.classList.add("active");
      cell.classList.add("cell");
      tapeHexEls.push(cell);
      row.append(" ", cell);

      const char = document.createElement("span");
      char.innerText = ".";
      if (j === 0) char.classList.add("active");
      char.classList.add("char");
      char.classList.add("blank");
      tapeAsciiEls.push(char);
      chars.push(char);
    }

    row.append(" ", ...chars);
    tapeEl.appendChild(row);
  }
  let hp = 0;
  let lastHp = 0;

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
      move: (x) => {
        hp += x;
        tapePtrEl.innerText = fmtHex(hp);

        if (lastHp !== -1) {
          tapeHexEls[lastHp].classList.remove("active");
          tapeAsciiEls[lastHp].classList.remove("active");
        }
        tapeHexEls[hp].classList.add("active");
        tapeAsciiEls[hp].classList.add("active");
        lastHp = hp;
      },
      read: () => tape[hp],
      write: (v) => {
        tape[hp] = v;
        tapeHexEls[hp].innerText = v.toString(16).padStart(2, "0");
        tapeHexEls[hp].classList.add("touched");
        const x = ASCII[v];
        if (x.length) {
          tapeAsciiEls[hp].innerText = x;
          tapeAsciiEls[hp].classList.remove("blank");
        } else {
          tapeAsciiEls[hp].innerText = ".";
          tapeAsciiEls[hp].classList.add("blank");
        }
      },
    },
  };
}

function fmtHex(n, p = "0") {
  return n.toString(16).padStart(4, p);
}

async function runWithDelay(delay) {
  errorsEl.innerText = "";
  const program = programInputEl.value;
  const peripherals = makePeripherals();
  try {
    const instructions = tokenize(program);
    instructionsEl.innerHTML =
      "<div id='instructions-header'>ADDR INS ARG</div>";
    const instructionEls = [];
    for (let i = 0; i < instructions.length; i++) {
      const [instr, arg] = instructions[i];
      const row = document.createElement("div");
      if (i === 0) row.classList.add("active");
      row.innerHTML = `
          <span>${fmtHex(i)}</span>
          <span>${BF_INSTRUCTIONS_MAP[instr]}</span>
          <span>${fmtHex(arg, " ").replaceAll(" ", "<span>0</span>")}</span>
        `;
      instructionsEl.appendChild(row);
      instructionEls.push(row);
    }
    let lastIp = 0;
    for (let ip of interpret(instructions, peripherals)) {
      if (lastIp !== -1) instructionEls[lastIp].classList.remove("active");
      instructionEls[ip].classList.add("active");
      lastIp = ip;

      instructionPtrEl.innerText = fmtHex(ip);
      if (delay > 0) await new Promise((res) => setTimeout(res, delay));
    }
  } catch (e) {
    errorsEl.innerText += String(e) + "\n";
    console.error(e);
  }
}

document.getElementById("run").addEventListener("click", () => runWithDelay(0));
document
  .getElementById("run-slow")
  .addEventListener("click", () => runWithDelay(10));
document
  .getElementById("run-slooow")
  .addEventListener("click", () => runWithDelay(100));

programInputEl.value = samples.helloWorld;
