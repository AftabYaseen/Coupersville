import Reveal from "./Reveal";

const principles = [
  {
    num: "Principle 01",
    title: (
      <>
        One request.
        <br />
        One contractor.
      </>
    ),
    body: "No auctions. No shared requests. No bidding wars. When a request is yours, it is yours alone.",
  },
  {
    num: "Principle 02",
    title: (
      <>
        Contractor
        <br />
        control.
      </>
    ),
    body: "Service providers decide how many requests they receive and can pause requests at any time, with no penalty.",
  },
  {
    num: "Principle 03",
    title: (
      <>
        Collaboration over
        <br />
        competition.
      </>
    ),
    body: "If a job needs additional skills, contractors are encouraged to partner with other providers, not compete against them.",
  },
];

export default function Principles() {
  return (
    <section className="section principles">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="section-num">§ 02 / Principles</span>
          <div>
            <h2>Built on fairness. By design.</h2>
            <p className="kicker">Three commitments that shape every part of the product.</p>
          </div>
        </Reveal>

        <Reveal className="principles-grid">
          {principles.map((p, i) => (
            <article className="principle" key={i}>
              <span className="num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
