import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand" style={{ color: "var(--cream)" }}>
              <BrandMark color="#F1EADB" />
              <span>FairGround</span>
            </div>
            <p>
              Powered by principled systems design. Built with respect for service providers.
            </p>
          </div>
          <div>
            <h5>Platform</h5>
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#guarantees">Fairness guarantee</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5>Get Started</h5>
            <ul>
              <li><a href="#cta">Join FairGround</a></li>
              <li><a href="#cta">Request beta access</a></li>
              <li><a href="#">Fairness policy</a></li>
              <li><a href="#">Contact us</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Terms of service</a></li>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 FairGround. All rights reserved.</div>
          <div className="credit">
            A FairGround resource from OPAL Quality Systems Management
          </div>
        </div>
      </div>
    </footer>
  );
}
