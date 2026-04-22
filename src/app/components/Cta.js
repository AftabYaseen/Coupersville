import Reveal from "./Reveal";
import { ArrowRight, ExternalArrow } from "./Icons";

export default function Cta() {
  return (
    <section className="cta" id="cta">
      <div className="wrap cta-inner">
        <Reveal as="h2">
          Stand on <em>Fair Ground.</em>
        </Reveal>
        <Reveal as="p">
          If you are tired of bidding wars, unpredictable lead costs, and unfair systems, FairGround offers a better way.
        </Reveal>
        <Reveal className="cta-ctas">
          <a href="#" className="btn btn-primary">
            Join FairGround
            <ArrowRight />
          </a>
          <a href="#" className="btn btn-ghost">
            Request beta access
          </a>
        </Reveal>
        <Reveal as="a" href="#" className="cta-link">
          Read our fairness policy
          <ExternalArrow />
        </Reveal>
      </div>
    </section>
  );
}
