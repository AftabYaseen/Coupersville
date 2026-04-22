import Reveal from "./Reveal";
import { Check } from "./Icons";

const guarantees = [
  "No shared or auctioned requests.",
  "No hidden fees.",
  "No forced overages.",
  "One active request per client at a time.",
  "Built-in safeguards to prevent abuse.",
];

export default function Guarantees() {
  return (
    <section className="guarantees" id="guarantees">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="section-num">§ 07 / Commitment</span>
          <div>
            <h2>Our commitment to fairness.</h2>
            <p className="kicker" style={{ color: "rgba(241, 234, 219, 0.72)" }}>
              Five guarantees that are not up for negotiation.
            </p>
          </div>
        </Reveal>

        <Reveal className="guarantees-grid">
          {guarantees.map((g, i) => (
            <div className="g-item" key={i}>
              <span className="tick" aria-hidden="true">
                <Check />
              </span>
              <p>{g}</p>
            </div>
          ))}
        </Reveal>

        <Reveal as="p" className="guarantees-statement">
          FairGround is infrastructure, not a marketplace designed to extract value.
        </Reveal>
      </div>
    </section>
  );
}
