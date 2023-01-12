import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { CombGraph } from "./CombGraph";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { prob } from "./probability";
import { useLatest } from "./useLatest";

export const DiceAstForm: FC<{ p: string }> = ({ p }) => {
  const router = useRouter();

  const [inputValue, setInputValue] = useState<string>(p);

  useEffect(() => {
    router.replace({ query: { ...router.query, p: inputValue } });
  }, [inputValue]);

  const parseResult = diceParser.parse(inputValue);

  const parsedExpr = useLatest(
    parseResult.status ? parseResult.value : undefined
  );

  return (
    <div>
      <form>
        <label htmlFor="dice-program-input">program</label>{" "}
        <input
          id="dice-program-input"
          type="text"
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
              if (parsedExpr !== undefined) {
                setInputValue(dicePrettyPrint(parsedExpr));
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
              if (parsedExpr !== undefined) {
                setInputValue(dicePrettyPrint(parsedExpr, { format: "min" }));
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
              if (parsedExpr !== undefined) {
                setInputValue(
                  dicePrettyPrint(parsedExpr, { format: "pedanticParens" })
                );
              }
            }}
          >
            pedanticParens
          </button>
        </fieldset>
        <noscript>
          <button>Compute</button>
        </noscript>
      </form>

      {parsedExpr ? (
        <CombGraph
          data={prob(parsedExpr)}
          width={800}
          height={600}
          padding={10}
        />
      ) : null}
      {parsedExpr ? (
        <table>
          <tbody>
            {[...prob(parsedExpr).entries()]
              .sort(([a], [b]) => a - b)
              .map(([k, v]) => (
                <tr key={k}>
                  <td style={{ textAlign: "right" }}>{k}</td>
                  <td style={{ textAlign: "right" }}>
                    {(v * 100).toFixed(2)}%
                  </td>
                  <td style={{ width: 1000 }}>
                    <div
                      style={{
                        width: `${v * 100}%`,
                        height: "18px",
                        backgroundColor: "darkgray",
                      }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};
