const BF_INSTRUCTIONS_ENUM = {
  ADD: "+".charCodeAt(0), // +
  SUB: "-".charCodeAt(0), // -
  LSH: "<".charCodeAt(0), // <
  RSH: ">".charCodeAt(0), // >
  COU: ".".charCodeAt(0), // .
  CIN: ",".charCodeAt(0), // ,
  JWZ: "[".charCodeAt(0), // [
  JNZ: "]".charCodeAt(0), // ]
};

export const BF_INSTRUCTIONS_MAP = Object.fromEntries(
  Object.entries(BF_INSTRUCTIONS_ENUM).map(([key, value]) => [value, key]),
);

/**
 * Very simple lexer to skip all non-BF-instruction characters.
 * @param {string} prog
 */
export function* lexer(prog) {
  for (let i = 0; i < prog.length; i++) {
    const curr = prog.charCodeAt(i);
    if (BF_INSTRUCTIONS_MAP[curr] === undefined) continue;
    yield [curr, i];
  }
}

/**
 * Tokenizer to parse a given BF program into an instructions array, collapsing
 * repeated operations and computing jumps as required
 * @param {string} prog
 * @returns
 */
export function tokenize(prog) {
  const instructions = [];
  const jumpStack = [];
  for (let [instr, idx] of lexer(prog)) {
    if (instr === BF_INSTRUCTIONS_ENUM.JWZ) {
      jumpStack.push(instructions.length);
      instructions.push([instr, 0]);
    } else if (instr === BF_INSTRUCTIONS_ENUM.JNZ) {
      const prev = jumpStack.pop();
      if (!prev) throw new Error(`Unmatched ] at ${idx}`);
      instructions.push([instr, prev]);
      instructions[prev][1] = instructions.length - 1;
    } else {
      if (
        instructions.length &&
        instructions[instructions.length - 1][0] === instr
      ) {
        instructions[instructions.length - 1][1]++;
      } else {
        instructions.push([instr, 1]);
      }
    }
  }

  if (jumpStack.length) throw new Error("Unmatched [");
  return instructions;
}

/** @typedef {{
    stdin: Generator<number, void, unknown>;
    stdout: (code: number) => void;
}} PeripheralStdio */
/** @typedef {{
    move: (delta: number) => void;
    read: () => number;
    write: (value: number) => void;
}} PeripheralTape */
/** @typedef{{ stdio: PeripheralStdio; tape: PeripheralTape; }} Peripherals */

/**
 * Interpret the given instructions
 * @param {[number, number][]} instructions
 * @param {Peripherals} peripherals
 */
export function* interpret(instructions, peripherals) {
  let ip = 0;
  while (instructions[ip]) {
    yield ip;
    let [instr, arg] = instructions[ip];
    switch (instr) {
      case BF_INSTRUCTIONS_ENUM.ADD:
        peripherals.tape.write(peripherals.tape.read() + arg);
        break;
      case BF_INSTRUCTIONS_ENUM.SUB:
        peripherals.tape.write(peripherals.tape.read() - arg);
        break;
      case BF_INSTRUCTIONS_ENUM.LSH:
        peripherals.tape.move(-arg);
        break;
      case BF_INSTRUCTIONS_ENUM.RSH:
        peripherals.tape.move(arg);
        break;
      case BF_INSTRUCTIONS_ENUM.COU:
        while (arg--) peripherals.stdio.stdout(peripherals.tape.read());
        break;
      case BF_INSTRUCTIONS_ENUM.CIN:
        while (arg--) peripherals.tape.write(peripherals.stdio.stdin.next());
        break;
      case BF_INSTRUCTIONS_ENUM.JWZ:
        if (peripherals.tape.read() === 0) ip = arg;
        break;
      case BF_INSTRUCTIONS_ENUM.JNZ:
        if (peripherals.tape.read() !== 0) ip = arg;
        break;
      default:
        throw new Error(
          `Illegal instruction encountered at #${ip}: ${instr} ${arg}`,
        );
    }
    ip++;
  }
  return ip;
}
