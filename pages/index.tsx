import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { DiceAstForm } from "../lib/DiceAstForm";
import { Disclaimer } from "../lib/Disclaimer";
import { Footer } from "../lib/Footer";

const DicePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dice equation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Disclaimer />
        <Link href="/examples">Examples</Link>
        <DiceAstForm />
      </main>
      <Footer />
    </>
  );
};

export default DicePage;
