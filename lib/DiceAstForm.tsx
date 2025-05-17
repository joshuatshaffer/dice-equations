import { useMemo } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { modifyUrl } from "vike/modifyUrl";
import { CombGraph } from "./CombGraph";
import styles from "./DiceAstForm.module.scss";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { diceLangSimplify } from "./dice-lang/dice-lang-simplify";
import { useGraphData } from "./useGraphData";
import { useLatest } from "./useLatest";

function useInputValue() {
  const { urlParsed, urlOriginal } = usePageContext();

  return [
    urlParsed.search.p || "2d6+3",
    (value: string) => {
      navigate(modifyUrl(urlOriginal, { search: { p: value } }), {
        overwriteLastHistoryEntry: true,
      });
    },
  ] as const;
}

export function DiceAstForm() {
  const [inputValue, setInputValue] = useInputValue();

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
}
