import Link from "next/link";
import { diceParser } from "../lib/dice-lang/dice-lang-parse";
import { dicePrettyPrint } from "../lib/dice-lang/dice-lang-pretty-print";
import { diceLangSimplify } from "../lib/dice-lang/dice-lang-simplify";
import styles from "./TestGallery.module.scss";

export function TestGallery() {
  return (
    <table className={styles.equationTable}>
      <tbody>
        <Row equation="2d6+3" />
        <Row equation="d20" />
        <Row equation="2d6" />
        <Row equation="d8*(2/3)" />
        <Row equation="8*(2/3)" />
        <Row equation="(2/3)*8" />
        <Row equation="1+2" />
        <Row equation="1-2" />
        <Row equation="2*3" />
        <Row equation="3/8" />
        <Row equation="d(d5)" />
        <Row equation="d(2/d5)" />
        <Row equation="lowest(1,2d20);d20;highest(1,2d20);highest(1,3d20)" />
      </tbody>
    </table>
  );
}

function Row({ equation }: { equation: string }) {
  const parseResult = diceParser.parse(equation);

  const parsedExpr = parseResult.status ? parseResult.value : undefined;

  return (
    <tr>
      <td>
        <Link href={{ pathname: "/", query: { p: equation } }}>
          <code>{equation}</code>
        </Link>
      </td>
      {parsedExpr ? (
        <>
          <td>
            <code>{dicePrettyPrint(parsedExpr)}</code>
          </td>
          <td>
            <code>{dicePrettyPrint(parsedExpr, { format: "min" })}</code>
          </td>
          <td>
            <code>{dicePrettyPrint(diceLangSimplify(parsedExpr))}</code>
          </td>
          <td
            dangerouslySetInnerHTML={{
              __html: dicePrettyPrint(parsedExpr, {
                format: "MathML",
              }),
            }}
          />
          <td
            dangerouslySetInnerHTML={{
              __html: dicePrettyPrint(diceLangSimplify(parsedExpr), {
                format: "MathML",
              }),
            }}
          />
        </>
      ) : null}
    </tr>
  );
}
