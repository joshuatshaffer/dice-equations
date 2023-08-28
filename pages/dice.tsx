import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { DiceAstForm } from "../lib/DiceAstForm";

const DicePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dice equation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Link href="/">Examples</Link>
        <DiceAstForm />
      </main>
    </>
  );
};

export default DicePage;
