import { useEffect, useState } from "react";
import { Program } from "../dice-lang/dice-lang-ast";
import GraphWorker from "./graph-web-worker?worker";

export function useGraphData(parsedProgram: Program | undefined) {
  const [graphData, setGraphData] = useState<
    readonly ReadonlyMap<number, number>[] | undefined
  >(undefined);

  useEffect(() => {
    if (parsedProgram === undefined) {
      return;
    }

    // Compute graph data in a web worker because it can sometimes be an
    // intensive computation.
    const worker = new GraphWorker();

    worker.addEventListener(
      "message",
      (event: MessageEvent<Map<number, number>[]>) => {
        setGraphData(event.data);
      }
    );

    worker.postMessage(parsedProgram);

    return () => {
      worker.terminate();
    };
  }, [parsedProgram]);

  return graphData;
}
