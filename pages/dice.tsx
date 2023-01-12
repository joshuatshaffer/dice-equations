import { NextPage } from "next";
import Head from "next/head";
import { DiceAstForm } from "../lib/DiceAstForm";
import { firstValue } from "../lib/firstValue";

interface DicePageProps {
  p: string;
}

const DicePage: NextPage<DicePageProps> = ({ p }) => {
  return (
    <>
      <Head>
        <title>Dice equation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <DiceAstForm p={p} />
      </main>
    </>
  );
};

export default DicePage;

DicePage.getInitialProps = (context) => {
  return { p: firstValue(context.query.p) || "2d6+3" };
};
