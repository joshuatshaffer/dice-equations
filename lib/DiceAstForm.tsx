import { FC, useState } from "react";
import { MyMath } from "./math-parser-example";
import { diceLanguage } from "./parseDice";

export const DiceAstForm: FC = () => {
  const [inputValue, setInputValue] = useState("2d6 + 5");

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.currentTarget.value);
        }}
      />
      <pre>{JSON.stringify(diceLanguage.expr.parse(inputValue))}</pre>
      <pre>{JSON.stringify(MyMath.parse(inputValue))}</pre>
    </div>
  );
};
