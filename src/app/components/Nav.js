import BrandMark from "./BrandMark";
import { ArrowRight } from "./Icons";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#top" className="brand">
          <BrandMark />
          <span>FairGround</span>
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="#guarantees">Our guarantee</a>
        </div>
        <a href="#cta" className="nav-cta">
          Request beta access
          <ArrowRight size={14} />
        </a>
      </div>
    </nav>
  );
}
