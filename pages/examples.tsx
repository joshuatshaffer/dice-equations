import Head from "next/head";
import { Disclaimer } from "../lib/Disclaimer";
import { Footer } from "../lib/Footer";
import { TestGallery } from "../lib/TestGallery";

export default function Home() {
  return (
    <>
      <Head>
        <title>Dice equation examples</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Disclaimer />
        <TestGallery />
      </main>
      <Footer />
    </>
  );
}
