import Reveal from "./Reveal";

export default function Problem() {
  const problems = [
    "Traditional lead platforms pit contractors against each other.",
    "The same request is sent to multiple providers, creating bidding wars.",
    "Pricing is unpredictable and often unfair.",
    "Contractors pay for requests without any real control.",
  ];

  return (
    <section className="section" id="why">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="section-num">§ 01 / Problem</span>
          <div>
            <h2>Why FairGround exists.</h2>
            <p className="kicker">
              The lead industry has, quietly, been working against the people it claims to serve.
            </p>
          </div>
        </Reveal>

        <Reveal className="problem-grid">
          {problems.map((p, i) => (
            <div className="problem-item" key={i}>
              <span className="x">×</span>
              <p>{p}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="problem-conclusion">
          <span className="marker">Our response</span>
          <p>FairGround was created to change that model entirely.</p>
        </Reveal>
      </div>
    </section>
  );
}
