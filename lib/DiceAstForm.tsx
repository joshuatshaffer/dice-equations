import { useRouter } from "next/router";
import { FC, useState } from "react";
import { CombGraph } from "./CombGraph";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { diceLangSimplify } from "./dice-lang/dice-lang-simplify";
import styles from "./DiceAstForm.module.scss";
import { prob } from "./probability";
import { useLatest } from "./useLatest";

export const DiceAstForm: FC<{ p: string }> = ({ p }) => {
  const router = useRouter();

  const [inputValue, _setInputValue] = useState<string>(p);

  const setInputValue = (value: string) => {
    _setInputValue(value);
    router.replace({ query: { ...router.query, p: inputValue } });
  };

  const parseResult = diceParser.parse(inputValue);

  const parsedProgram = useLatest(
    parseResult.status ? parseResult.value : undefined
  );

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

      {parsedProgram ? (
        <CombGraph
          className={styles.graph}
          data={parsedProgram.map((p) => new Map(prob(p)))}
          width={800}
          height={600}
          padding={10}
        />
      ) : null}
    </div>
  );
};
