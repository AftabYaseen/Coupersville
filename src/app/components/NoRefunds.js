import Reveal from "./Reveal";

export default function NoRefunds() {
  return (
    <section className="no-refunds">
      <div className="wrap">
        <div className="no-refunds-inner">
          <Reveal>
            <span
              className="section-num"
              style={{ marginBottom: 18, display: "block" }}
            >
              § 06 / Accountability
            </span>
            <h3>
              Why there are <em>no refunds</em> for requests.
            </h3>
          </Reveal>
          <Reveal>
            <p>
              Because FairGround guarantees exclusivity and fairness, requests are delivered in good faith and are not refundable. This ensures responsibility on both sides and prevents misuse of the system.
            </p>
            <p
              style={{
                marginTop: 20,
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontSize: 18,
                color: "var(--sage)",
              }}
            >
              Accountability runs both ways. That is what makes the guarantee real.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
