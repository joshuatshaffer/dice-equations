"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ComponentType, useEffect, useMemo, useState } from "react";
import { CombGraph } from "./CombGraph";
import styles from "./DiceAstForm.module.scss";
import { Program } from "./dice-lang/dice-lang-ast";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { diceLangSimplify } from "./dice-lang/dice-lang-simplify";
import { useLatest } from "./useLatest";

function foo({ signal }: { signal: AbortSignal }) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./graph-web-worker.ts", import.meta.url)
    );

    signal.addEventListener(
      "abort",
      () => {
        reject(signal.reason);
        worker.terminate();
      },
      { once: true }
    );

    worker.addEventListener(
      "error",
      (event) => {
        reject(event);
      },
      { once: true }
    );

    worker.addEventListener(
      "message",
      (event: MessageEvent<Map<number, number>[]>) => {
        resolve(event.data);
      },
      { once: true }
    );

    worker.postMessage(parsedProgram);
  });
}

function useGraphData(parsedProgram: Program | undefined) {
  const [graphData, setGraphData] = useState<
    readonly ReadonlyMap<number, number>[] | undefined
  >(undefined);

  useEffect(() => {
    if (parsedProgram === undefined) {
      return;
    }

    // Compute graph data in a web worker because it can some times be an intensive computation.
    const worker = new Worker(
      new URL("./graph-web-worker.ts", import.meta.url)
    );

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

function clientOnly<P = {}>(Component: ComponentType<P>) {
  return dynamic(() => Promise.resolve(Component), { ssr: false });
}

export const DiceAstForm = clientOnly(() => {
  const router = useRouter();

  const [inputValue, _setInputValue] = useState<string>(
    // `router.query.p` is `undefined` on first render.
    () => new URLSearchParams(window.location.search).get("p") || "2d6+3"
  );

  const setInputValue = (value: string) => {
    _setInputValue(value);
    router.replace({ query: { ...router.query, p: value } });
  };

  const parseResult = useMemo(() => diceParser.parse(inputValue), [inputValue]);

  const parsedProgram = useLatest(
    parseResult.status ? parseResult.value : undefined
  );

  const graphData = useGraphData(parsedProgram);

  return (
    <div>
      <form className={styles.form}>
        <label htmlFor="dice-program-input">program</label>{" "}
        <textarea
          id="dice-program-input"
          rows={5}
          name="p"
          aria-invalid={!parseResult.status}
          aria-describedby="dice-program-input-helper"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
          }}
        />
        <div id="dice-program-input-helper">
          {parseResult.status ? null : (
            <>
              Could not parse. <pre>{JSON.stringify(parseResult)}</pre>
            </>
          )}
        </div>
        <fieldset>
          <legend>Reformat</legend>
          <button
            name="format"
            value="pretty-print"
            onClick={(event) => {
              event.preventDefault();
              if (parsedProgram !== undefined) {
                setInputValue(dicePrettyPrint(parsedProgram));
              }
            }}
          >
            pretty print
          </button>{" "}
          <button
            name="format"
            value="minify"
            onClick={(event) => {
              event.preventDefault();
              if (parsedProgram !== undefined) {
                setInputValue(
                  dicePrettyPrint(parsedProgram, { format: "min" })
                );
              }
            }}
          >
            minify
          </button>{" "}
          <button
            name="format"
            value="pedantic-parens"
            onClick={(event) => {
              event.preventDefault();
              if (parsedProgram !== undefined) {
                setInputValue(
                  dicePrettyPrint(parsedProgram, { format: "pedanticParens" })
                );
              }
            }}
          >
            pedanticParens
          </button>
        </fieldset>
        <button
          onClick={(event) => {
            event.preventDefault();
            if (parsedProgram !== undefined) {
              setInputValue(dicePrettyPrint(diceLangSimplify(parsedProgram)));
            }
          }}
        >
          simplify
        </button>
        <noscript>
          <button>Compute</button>
        </noscript>
      </form>

      {parsedProgram ? (
        <div
          className={styles.mathDisplay}
          dangerouslySetInnerHTML={{
            __html: dicePrettyPrint(parsedProgram, {
              format: "MathML",
            }),
          }}
        />
      ) : null}

      {graphData ? (
        <CombGraph
          className={styles.graph}
          data={graphData}
          width={800}
          height={600}
          padding={10}
        />
      ) : null}
    </div>
  );
});
