import Reveal from "./Reveal";
import { ArrowRight, Lock } from "./Icons";

export default function Pricing() {
  return (
    <section className="section pricing" id="pricing">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="section-num">§ 05 / Pricing</span>
          <div>
            <h2>Simple, predictable pricing.</h2>
            <p className="kicker">Two plans. No auctions. No surprise charges. Ever.</p>
          </div>
        </Reveal>

        <Reveal className="pricing-grid">
          <div className="plan featured">
            <span className="tag">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <circle cx="5" cy="5" r="5" />
              </svg>
              Founding / Beta Member
            </span>
            <h3>Beta, Phase II</h3>
            <p className="blurb">
              Sign up by June 30, 2026. Founding members keep beta pricing for 12 months.
            </p>
            <div className="price">
              <span className="amount">$39</span>
              <span className="per">/ month</span>
            </div>
            <div className="setup">$0 setup fee</div>
            <ul>
              <li>15 exclusive service requests included</li>
              <li>$8 per additional request</li>
              <li>Requests auto-pause at your cap unless you choose otherwise</li>
              <li>Pause or resume any time, one click</li>
              <li>Month to month. Cancel anytime.</li>
            </ul>
            <a href="#cta" className="btn btn-primary plan-btn">
              Request beta access
              <ArrowRight />
            </a>
          </div>

          <div className="plan">
            <span className="tag">Standard Pricing, GA</span>
            <h3>General Availability</h3>
            <p className="blurb">
              Official launch August 31. Transparent pricing, same fairness.
            </p>
            <div className="price">
              <span className="amount">$59</span>
              <span className="per">/ month</span>
            </div>
            <div className="setup">$79 one-time setup fee</div>
            <ul>
              <li>15 exclusive service requests included</li>
              <li>$10 per additional request</li>
              <li>Full request-cap control</li>
              <li>Pause or resume any time, one click</li>
              <li>No surprise charges. Ever.</li>
            </ul>
            <a href="#cta" className="btn btn-ghost plan-btn">
              Join the waitlist
              <ArrowRight />
            </a>
          </div>
        </Reveal>

        <Reveal className="pricing-promise">
          <div className="lock" aria-hidden="true">
            <Lock />
          </div>
          <p>
            <span>Pricing promise</span>
            FairGround will never charge for requests without your consent.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
