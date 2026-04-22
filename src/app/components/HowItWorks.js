import Reveal from "./Reveal";

const steps = [
  {
    num: "01",
    title: "Service providers join the network.",
    body: "Create a professional profile and receive a unique FairGround request link you can share with clients and partners.",
  },
  {
    num: "02",
    title: "Clients submit one exclusive request.",
    body: "Clients submit a request via your link or by browsing the network. They may only have one active request at a time.",
  },
  {
    num: "03",
    title: "No bidding. No shopping.",
    body: "Requests are exclusive to you. You are not competing against other contractors for the same job.",
  },
  {
    num: "04",
    title: "Get the job done, or close the request.",
    body: "Complete the job by any lawful means, including collaboration, or formally close the request. Accountability runs both ways.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="section-num">§ 03 / Process</span>
          <div>
            <h2>How FairGround works.</h2>
            <p className="kicker">A simple, exclusive flow from request to resolution.</p>
          </div>
        </Reveal>

        <Reveal className="steps">
          {steps.map((s) => (
            <div className="step" key={s.num}>
              <span className="step-num">{s.num}</span>
              <div className="step-body">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              <span className="step-arrow">→</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
