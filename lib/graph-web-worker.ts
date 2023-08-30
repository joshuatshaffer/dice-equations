import { Program } from "./dice-lang/dice-lang-ast";
import { prob } from "./probability";

addEventListener(
  "message",
  ({ data: parsedProgram }: MessageEvent<Program>) => {
    postMessage(parsedProgram.map((p) => new Map(prob(p))));
  }
);
