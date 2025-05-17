import { Disclaimer } from "../../lib/Disclaimer";
import { Footer } from "../../lib/Footer";
import { TestGallery } from "../../lib/TestGallery";

export default function Page() {
  return (
    <>
      <main>
        <Disclaimer />
        <TestGallery />
      </main>
      <Footer />
    </>
  );
}
