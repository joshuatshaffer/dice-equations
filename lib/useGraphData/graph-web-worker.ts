import { Program } from "../dice-lang/dice-lang-ast";
import { pmf } from "../probability";

addEventListener(
  "message",
  ({ data: parsedProgram }: MessageEvent<Program>) => {
    postMessage(parsedProgram.map((p) => new Map(pmf(p))));
  }
);
