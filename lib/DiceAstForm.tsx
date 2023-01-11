import { useRouter } from "next/router";
import { FC, useEffect, useRef, useState } from "react";
import { CombGraph } from "./CombGraph";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { prob } from "./probability";

// the largest value k such that for all x in xs, x = k*n+min(xs)

function firstValue(x: string | string[] | undefined): string | undefined {
  if (Array.isArray(x)) return x[0];
  return x;
}

export const DiceAstForm: FC = () => {
  const router = useRouter();

  const [inputValue, setInputValue] = useState<string>(
    firstValue(router.query.p) || "2d6 + 5"
  );

  useEffect(() => {
    router.replace({ query: { ...router.query, p: inputValue } });
  }, [inputValue]);

  const pr = diceParser.parse(inputValue);

  const prsRef = useRef(pr);
  if (pr.status) {
    prsRef.current = pr;
  }
  const prs = prsRef.current;

  return (
    <div>
      <input
        type="text"
        name="p"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.currentTarget.value);
        }}
      />
      <pre>{JSON.stringify(pr)}</pre>
      <button
        type="button"
        disabled={!pr.status}
        onClick={() => {
          if (pr.status) {
            setInputValue(dicePrettyPrint(pr.value));
          }
        }}
      >
        pretty print
      </button>
      <button
        type="button"
        disabled={!pr.status}
        onClick={() => {
          if (pr.status) {
            setInputValue(dicePrettyPrint(pr.value, { format: "min" }));
          }
        }}
      >
        minify
      </button>
      <button
        type="button"
        disabled={!pr.status}
        onClick={() => {
          if (pr.status) {
            setInputValue(
              dicePrettyPrint(pr.value, { format: "pedanticParens" })
            );
          }
        }}
      >
        pedanticParens
      </button>

      {prs.status ? (
        <CombGraph
          data={prob(prs.value)}
          width={800}
          height={600}
          padding={10}
        />
      ) : null}
      {prs.status ? (
        <table>
          <tbody>
            {[...prob(prs.value).entries()]
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
