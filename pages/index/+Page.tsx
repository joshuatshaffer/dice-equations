import { DiceAstForm } from "../../lib/DiceAstForm";
import { Disclaimer } from "../../lib/Disclaimer";
import { Footer } from "../../lib/Footer";
import { Link } from "../../lib/Link";

export default function Page() {
  return (
    <>
      <main>
        <Disclaimer />
        <Link href="/dice/examples">Examples</Link>
        <DiceAstForm />
      </main>
      <Footer />
    </>
  );
}
