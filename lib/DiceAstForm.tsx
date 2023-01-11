import { FC, useRef, useState } from "react";
import { CombGraph } from "./CombGraph";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { prob } from "./probability";

// the largest value k such that for all x in xs, x = k*n+min(xs)

export const DiceAstForm: FC = () => {
  const [inputValue, setInputValue] = useState("2d6 + 5");

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
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.currentTarget.value);
        }}
      />
      <pre>{JSON.stringify(pr)}</pre>
      <div>{prs.status ? dicePrettyPrint(prs.value) : null}</div>
      {prs.status ? (
        <CombGraph data={prob(prs.value)} width={800} height={600} />
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
