import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { DiceAstForm } from "../lib/DiceAstForm";
import { Disclaimer } from "../lib/Disclaimer";

const DicePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dice equation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Disclaimer />
        <Link href="/">Examples</Link>
        <DiceAstForm />
      </main>
    </>
  );
};

export default DicePage;
