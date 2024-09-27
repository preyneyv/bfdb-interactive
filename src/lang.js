const BF_INSTRUCTIONS_STR = "+-<>.,[]";
const BF_INSTRUCTIONS = {
  ADD: 0, // +
  SUB: 1, // -
  LSH: 2, // <
  RSH: 3, // >
  CHO: 4, // .
  CHI: 5, // ,
  JWZ: 6, // [
  JNZ: 7, // ]
};

/**
 * Very simple lexer to skip all non-BF-instruction characters.
 * @param {string} prog
 */
export function* lexer(prog) {
  for (let i = 0; i < prog.length; i++) {
    const curr = prog[i];
    const idx = BF_INSTRUCTIONS_STR.indexOf(curr);
    if (idx === -1) continue;
    yield [idx, i];
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
    if (instr === BF_INSTRUCTIONS.JWZ) {
      jumpStack.push(instructions.length);
      instructions.push([instr, 0]);
    } else if (instr === BF_INSTRUCTIONS.JNZ) {
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
      case BF_INSTRUCTIONS.ADD:
        peripherals.tape.write(peripherals.tape.read() + arg);
        break;
      case BF_INSTRUCTIONS.SUB:
        peripherals.tape.write(peripherals.tape.read() - arg);
        break;
      case BF_INSTRUCTIONS.LSH:
        peripherals.tape.move(-arg);
        break;
      case BF_INSTRUCTIONS.RSH:
        peripherals.tape.move(arg);
        break;
      case BF_INSTRUCTIONS.CHO:
        while (arg--) peripherals.stdio.stdout(peripherals.tape.read());
        break;
      case BF_INSTRUCTIONS.CHI:
        while (arg--) peripherals.tape.write(peripherals.stdio.stdin.next());
        break;
      case BF_INSTRUCTIONS.JWZ:
        if (peripherals.tape.read() === 0) ip = arg;
        break;
      case BF_INSTRUCTIONS.JNZ:
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
