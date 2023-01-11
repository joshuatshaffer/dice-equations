import { FC, useState } from "react";
import { diceParser } from "./dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang/dice-lang-pretty-print";
import { prob } from "./probability";

export const DiceAstForm: FC = () => {
  const [inputValue, setInputValue] = useState("2d6 + 5");

  const pr = diceParser.parse(inputValue);
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
      <div>{pr.status ? dicePrettyPrint(pr.value) : null}</div>
      {pr.status ? (
        <table>
          <tbody>
            {[...prob(pr.value).entries()].map(([k, v]) => (
              <tr key={k}>
                <td style={{ textAlign: "right" }}>{k}</td>
                <td style={{ textAlign: "right" }}>{(v * 100).toFixed(2)}%</td>
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
