import { clientOnly } from "vike-react/clientOnly";
import { Disclaimer } from "../../lib/Disclaimer";
import { Footer } from "../../lib/Footer";
import { Link } from "../../lib/Link";

const DiceAstForm = clientOnly(
  async () => (await import("../../lib/DiceAstForm")).DiceAstForm
);

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
