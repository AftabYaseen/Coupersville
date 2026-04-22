import Reveal from "./Reveal";

export default function Audience() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="audience">
          <Reveal className="audience-left">
            <span className="section-num" style={{ marginBottom: 18, display: "block" }}>
              § 04 / Audience
            </span>
            <h2>Who FairGround is designed for.</h2>
            <p className="kicker">
              If you provide legitimate services and value fairness, FairGround is built for you.
            </p>
          </Reveal>

          <Reveal className="audience-right">
            <div className="audience-list">
              <span className="tag">Primary focus</span>
              <ul>
                <li>Home service contractors</li>
                <li>Commercial service providers</li>
                <li>Trades, facilities, and service professionals</li>
              </ul>
            </div>
            <div className="audience-list">
              <span className="tag">Also open to</span>
              <ul>
                <li>Professional service providers</li>
                <li>Consultants and specialized service businesses</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
