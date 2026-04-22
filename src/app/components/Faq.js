"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const faqs = [
  {
    q: "What is the Beta Access Program?",
    a: (
      <p>
        The Beta Access Program gives early businesses access to the platform before public launch. Beta members help shape the product and lock in preferred pricing while we finish building and refining the system.
      </p>
    ),
  },
  {
    q: "Who is this platform designed for?",
    a: (
      <p>
        The platform is designed primarily for home services and commercial service providers, such as contractors, cleaners, landscapers, and facility services. That said, any professional who accepts client requests is welcome to join the beta.
      </p>
    ),
  },
  {
    q: "How is this different from Angi, HomeAdvisor, or Thumbtack?",
    a: (
      <>
        <p>The key differences:</p>
        <ul>
          <li>No shared leads</li>
          <li>No auctions or bidding wars</li>
          <li>Flat monthly pricing</li>
          <li>You control how many requests you receive</li>
          <li>You can pause requests at any time</li>
          <li>No surprise fees</li>
        </ul>
        <p>Requests come either directly from your custom link or from customers browsing the network.</p>
      </>
    ),
  },
  {
    q: "What counts as a service request?",
    a: (
      <p>
        A service request is a verified inquiry from a prospective client who has provided: name, email, phone number, and service details. No anonymous or incomplete requests are delivered.
      </p>
    ),
  },
  {
    q: "What happens if I reach my monthly request limit?",
    a: (
      <p>
        Once you reach 15 requests, you choose what happens next. You can pause requests for the rest of the month, or continue receiving requests at $8 per additional request. You are always in control.
      </p>
    ),
  },
  {
    q: "Can I turn requests off temporarily?",
    a: (
      <p>
        Yes. You can pause or resume requests at any time with one click. There are no penalties for pausing.
      </p>
    ),
  },
  {
    q: "Will my price increase after beta ends?",
    a: (
      <p>
        Founding members keep beta pricing for at least 12 months from their signup date. After that, standard pricing applies, with notice given well in advance. There are no surprise increases.
      </p>
    ),
  },
  {
    q: "Is there a long-term contract?",
    a: <p>No. The beta is month to month. You can cancel at any time.</p>,
  },
  {
    q: "Why do you require my business and contact information?",
    a: (
      <p>
        We require real business information to ensure lead quality, prevent spam, and maintain trust across the network. This protects both service providers and clients.
      </p>
    ),
  },
  {
    q: "What do you expect from beta members?",
    a: (
      <p>
        Beta members are encouraged (but not burdened) to use the platform actively, share feedback, and help us identify bugs or missing features. Your real-world input helps shape the product.
      </p>
    ),
  },
  {
    q: "How many beta spots are available?",
    a: (
      <p>
        Beta access is limited to the first 100 to 250 businesses and will close once capacity is reached.
      </p>
    ),
  },
  {
    q: "How do I join the beta?",
    a: (
      <p>
        Complete the beta signup form, enter your payment details, and you will get immediate access to the platform.
      </p>
    ),
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex((curr) => (curr === i ? null : i));
  };

  return (
    <section className="section" id="faq">
      <div className="wrap-narrow">
        <Reveal className="section-head" style={{ gridTemplateColumns: "1fr" }}>
          <span className="section-num">§ 08 / Questions</span>
          <div>
            <h2>Frequently asked.</h2>
            <p className="kicker">
              Straight answers about the beta, pricing, and how the platform operates.
            </p>
          </div>
        </Reveal>

        <Reveal className="faq-list">
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                className="faq-item"
                key={i}
                data-open={open ? "true" : "false"}
              >
                <button
                  className="faq-q"
                  aria-expanded={open}
                  onClick={() => toggle(i)}
                >
                  {item.q}
                  <span className="plus">+</span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{item.a}</div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
