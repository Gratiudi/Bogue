import { useState } from "react";

const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

export function ContactPage() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!accessKey) {
      setStatus({
        type: "error",
        message: "The contact form is not configured yet.",
      });
      return;
    }

    setSending(true);
    setStatus({ type: "info", message: "Sending your message…" });
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form));
    formData.access_key = accessKey;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Unable to send your message.");
      setStatus({
        type: "success",
        message: result.message || "Your message was sent.",
      });
      form.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="contact-page page-section">
      <h1>📞 Contact Us</h1>
      <p className="contact-intro">
        Have questions, feedback, or need help? We'd love to hear from you.
        Reach out to us through the form below or use the contact info provided.
      </p>
      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Your Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Your Name"
            autoComplete="name"
            required
          />
          <label htmlFor="contact-email">Your Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="Your Email"
            autoComplete="email"
            required
          />
          <label htmlFor="contact-message">Your Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows="5"
            placeholder="Your Message"
            required
          />
          <button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send Message"}
          </button>
          {status.message && (
            <p className={`form-status ${status.type}`} role="status">
              {status.message}
            </p>
          )}
        </form>

        <div className="contact-info">
          <h2>📍 Our Location</h2>
          <p>Addis Ababa, Ethiopia</p>
          <h2>📧 Email</h2>
          <p>
            <a href="mailto:bogueofficialhub@gmail.com">
              bogueofficialhub@gmail.com
            </a>
          </p>
          <h2>📱 Phone</h2>
          <p>
            <a href="tel:+251938246049">+251 938 246 049</a>
          </p>
          <h2>🕒 Working Hours</h2>
          <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
          <h2>🌐 Map</h2>
          <iframe
            title="Map showing Addis Ababa, Ethiopia"
            src="https://www.google.com/maps?q=addis+ababa+ethiopia&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
