import { FC, useState } from "react";
import { MyMath } from "./math-parser-example";
import { diceLanguage } from "./parseDice";
import { prob } from "./probability";

export const DiceAstForm: FC = () => {
  const [inputValue, setInputValue] = useState("2d6 + 5");

  const pr = diceLanguage.expr.parse(inputValue);
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
      {pr.status ? JSON.stringify(prob(pr.value)) : null}
    </div>
  );
};
