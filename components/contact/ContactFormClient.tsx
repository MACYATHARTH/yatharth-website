"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    subject: "General Enquiry",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required.";
    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.college.trim()) {
      errs.college = "College / University / Organization is required.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      errs.message = "Message must be at least 15 characters long.";
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Client-side simulation of local dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        college: "",
        subject: "General Enquiry",
        message: "",
      });
    }, 600);
  };

  return (
    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-6 sm:p-8 space-y-6">
      <div className="border-b border-[var(--theme-border)] pb-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--theme-text-primary)]">
          Direct Inquiry &amp; Delegation Desk
        </h2>
        <p className="text-xs text-[var(--theme-text-muted)] mt-1">
          Submit an official inquiry for assistance with registrations, press passes, rules, or delegation logistics.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]/50 text-center space-y-4">
          <CheckCircle2 className="w-8 h-8 text-[var(--theme-text-primary)] mx-auto" />
          <h3 className="font-bold text-base text-[var(--theme-text-primary)]">
            Dispatch Logged Successfully
          </h3>
          <p className="text-xs text-[var(--theme-text-muted)] max-w-md mx-auto leading-relaxed">
            Your inquiry has been registered with the YATHARTH &apos;26 Organizing Committee. A coordinator will respond to your provided email address shortly.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center px-5 py-2.5 border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Send Another Dispatch
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                Full Name <span className="text-[var(--theme-text-primary)]">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Priyanshu Kashyap"
                className={`w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)]/40 border text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)]/50 focus:outline-hidden focus:border-[var(--theme-text-primary)] ${
                  errors.name ? "border-red-500" : "border-[var(--theme-border)]"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-400 font-mono">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                Email Address <span className="text-[var(--theme-text-primary)]">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. delegate@collegemail.edu"
                className={`w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)]/40 border text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)]/50 focus:outline-hidden focus:border-[var(--theme-text-primary)] ${
                  errors.email ? "border-red-500" : "border-[var(--theme-border)]"
                }`}
              />
              {errors.email && <p className="text-[11px] text-red-400 font-mono">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College */}
            <div className="space-y-1.5">
              <label htmlFor="college" className="block text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                College / Institution <span className="text-[var(--theme-text-primary)]">*</span>
              </label>
              <input
                id="college"
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. St. Stephen's College, DU"
                className={`w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)]/40 border text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)]/50 focus:outline-hidden focus:border-[var(--theme-text-primary)] ${
                  errors.college ? "border-red-500" : "border-[var(--theme-border)]"
                }`}
              />
              {errors.college && <p className="text-[11px] text-red-400 font-mono">{errors.college}</p>}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label htmlFor="subject" className="block text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                Inquiry Category
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-primary)] focus:outline-hidden focus:border-[var(--theme-text-primary)] cursor-pointer"
              >
                <option value="General Enquiry" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">General Festival Enquiry</option>
                <option value="Registration & Eligibility" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Registration &amp; Eligibility</option>
                <option value="Press & Media Passes" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Press Passes &amp; Accreditation</option>
                <option value="Sponsorship & Partnership" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Sponsorship &amp; Alliances</option>
                <option value="Grievance / Rule Clarification" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Rulebook Clarification</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
              Message / Details <span className="text-[var(--theme-text-primary)]">*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="State your question, delegation requirements, or specific requests..."
              className={`w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)]/40 border text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)]/50 focus:outline-hidden focus:border-[var(--theme-text-primary)] ${
                errors.message ? "border-red-500" : "border-[var(--theme-border)]"
              }`}
            />
            {errors.message && <p className="text-[11px] text-red-400 font-mono">{errors.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[var(--theme-cta)] text-[var(--theme-cta-text)] hover:opacity-90 text-xs font-mono uppercase font-bold tracking-wider transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Dispatching..." : "Submit Official Inquiry →"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
