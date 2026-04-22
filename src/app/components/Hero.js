import { ArrowRight } from "./Icons";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span className="dot"></span>
              <span className="eyebrow">Beta Phase II, Founding Members</span>
            </div>
            <h1 className="hero-headline">
              A{" "}
              <span className="accent accent-underline">fair</span> way
              <br />
              to receive service
              <br />
              requests.
            </h1>
            <p className="hero-lede">
              FairGround is not a lead auction. It is a request system built to
              protect contractors and service providers from bidding wars,
              surprise fees, and unfair lead marketplaces.
            </p>
            <div className="hero-ctas">
              <a href="#cta" className="btn btn-primary">
                Join FairGround
                <ArrowRight />
              </a>
              <a href="#how" className="btn btn-ghost">
                Learn how it works
              </a>
            </div>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="num">1</span>
              <span className="label">
                Request. One contractor. Never shared, never auctioned.
              </span>
            </div>
            <div className="hero-meta-item">
              <span className="num">15</span>
              <span className="label">
                Exclusive service requests per month, with a hard cap you control.
              </span>
            </div>
            <div className="hero-meta-item">
              <span className="num">0</span>
              <span className="label">
                Bidding wars. Zero surprise fees. Zero forced overages.
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
