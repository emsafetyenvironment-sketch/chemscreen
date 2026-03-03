import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to send message.");
    }
  }

  if (status === "success") {
    return (
      <div id="contact" className="max-w-3xl mx-auto mt-12 mb-8">
        <div className="rounded-2xl border border-navy-700 bg-navy-800 p-6 text-center">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-white font-semibold">Message sent! I'll get back to you soon.</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="contact" className="max-w-3xl mx-auto mt-12 mb-8">
      <div className="rounded-2xl border border-navy-700 bg-navy-800 p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-1">Get in Touch</h2>
        <p className="text-navy-400 text-sm mb-6">Questions, feedback or consulting inquiries — send a message below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-navy-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-white placeholder-navy-500 focus:outline-none focus:border-cyan-500 text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-white placeholder-navy-500 focus:outline-none focus:border-cyan-500 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-300 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-white placeholder-navy-500 focus:outline-none focus:border-cyan-500 text-sm resize-y"
              placeholder="Your message..."
            />
          </div>
          {status === "error" && (
            <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">
              {errorMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
