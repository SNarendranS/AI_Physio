// ContactsPage.jsx
import React, { useState } from "react";
import "./Contact.css";

export default function ContactsPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake submit for demo — replace with API call
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus(null), 3000);
    }, 900);
  };

  return (
    <div className="contacts-root">
      <div className="contacts-hero">
        <div className="hero-inner">
          <h1>Get in touch</h1>
          <p className="muted">We’d love to hear from you — questions, feedback, or project ideas.</p>
        </div>
        <svg className="hero-orn" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop stopColor="#7c3aed" offset="0" />
              <stop stopColor="#06b6d4" offset="1" />
            </linearGradient>
          </defs>
          <path d="M0 100 C150 10 450 190 600 100 L600 200 L0 200 Z" fill="url(#g1)" opacity="0.12" />
        </svg>
      </div>

      <div className="contacts-content">
        <div className="left">
          <div className="card contact-info">
            <h3>Contact details</h3>
            <p className="muted">Available Mon — Fri, 9:00AM — 6:00PM</p>

            <div className="info-grid">
              <div className="info-row">
                <svg className="icon" viewBox="0 0 24 24"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h15A2.5 2.5 0 0 1 22 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 19.5v-15zM7 8l5 3 5-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div>
                  <div className="label">Email</div>
                  <div className="value">hello@yourdomain.com</div>
                </div>
              </div>

              <div className="info-row">
                <svg className="icon" viewBox="0 0 24 24"><path d="M21 16.5a2.5 2.5 0 0 1-2 2.4c-1 .3-2.4.6-4 .6-3 0-5.6-2.6-5.6-5.6 0-1.6.2-3 .6-4a2.5 2.5 0 0 1 2.4-2 2.5 2.5 0 0 1 2.2 1.3l1.2 2.3a.8.8 0 0 0 .9.4l2.6-.8a2 2 0 0 1 2.5 2.5l-.8 2.6a.8.8 0 0 0 .4.9l2.3 1.2c.6.3.9 1 .6 1.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div>
                  <div className="label">Phone</div>
                  <div className="value">+91 98765 43210</div>
                </div>
              </div>

              <div className="info-row">
                <svg className="icon" viewBox="0 0 24 24"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div>
                  <div className="label">Address</div>
                  <div className="value">Chennai, India</div>
                </div>
              </div>
            </div>

            <div className="badges">
              <span className="badge">Fast response</span>
              <span className="badge">Secure</span>
              <span className="badge">24/7</span>
            </div>
          </div>

          <div className="card map-card">
            <div className="map-placeholder">Map placeholder — swap with iframe or map component</div>
          </div>
        </div>

        <div className="right">
          <form className="card contact-form" onSubmit={handleSubmit}>
            <h3>Send a message</h3>
            <div className="row">
              <label>
                <span>Name</span>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" type="email" required />
              </label>
            </div>

            <label>
              <span>Subject</span>
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="What is this about?" />
            </label>

            <label>
              <span>Message</span>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Write your message" rows={6} required />
            </label>

            <div className="form-actions">
              <button className="btn primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send message"}</button>
              <button className="btn ghost" type="button" onClick={() => setForm({ name: "", email: "", subject: "", message: "" })}>Reset</button>
            </div>

            {status === "sent" && <div className="success">Thanks — your message was sent.</div>}
          </form>

          <div className="card social-card">
            <h4>Reach out on</h4>
            <div className="social-list">
              <a className="social" href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24"><path d="M4 4h4v16H4zM6 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 8h4v2h.1a4.4 4.4 0 0 1 4-2.2c4.3 0 5 2.8 5 6.3V20h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V20h-4z" fill="currentColor"/></svg>
                <span>LinkedIn</span>
              </a>

              <a className="social" href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24"><path d="M23 3c-.8.4-1.6.7-2.5.8a4.3 4.3 0 0 0-7.3 3v.6A11 11 0 0 1 3 4s-4 9 5 13c-1 0-2.2-.3-3-.8 0 3 2 5.3 5 5.9 0 .1 3.3 0 6-2.2 3.7-4 6-8.4 6-14v-.6A6.6 6.6 0 0 0 23 3z" fill="currentColor"/></svg>
                <span>Twitter</span>
              </a>

              <a className="social" href="#" aria-label="Email">
                <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="contacts-footer">
        <small>© {new Date().getFullYear()} Your Company — All rights reserved</small>
      </footer>
    </div>
  );
}

