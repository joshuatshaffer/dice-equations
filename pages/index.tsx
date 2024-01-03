import Head from "next/head";
import { Disclaimer } from "../lib/Disclaimer";
import { TestGallery } from "../lib/TestGallery";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Disclaimer />
        <TestGallery />
      </main>
    </>
  );
}
