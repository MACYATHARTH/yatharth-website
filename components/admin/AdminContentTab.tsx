"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  updateFestivalContentAction,
  updateFestivalDatesAction,
} from "@/app/admin/actions";

interface AdminContentTabProps {
  initialContent: {
    themeTitle: string;
    tagline: string;
    heroSupportingCopy: string;
    college: string;
    department: string;
    aboutIntro: string;
    aboutParagraphs: string[];
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
  };
  initialDates?: {
    startDate: string | null;
    endDate: string | null;
    isDateConfirmed: boolean;
  };
  isDevelopment: boolean;
}

export function AdminContentTab({
  initialContent,
  initialDates,
  isDevelopment,
}: AdminContentTabProps) {
  // Festival Dates State
  const [startDate, setStartDate] = useState(
    initialDates?.startDate ? initialDates.startDate.split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    initialDates?.endDate ? initialDates.endDate.split("T")[0] : ""
  );
  const [isDateConfirmed, setIsDateConfirmed] = useState(
    initialDates?.isDateConfirmed ?? false
  );
  const [dateMessage, setDateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDatePending, startDateTransition] = useTransition();

  const handleSaveDates = () => {
    setDateMessage(null);
    startDateTransition(async () => {
      const res = await updateFestivalDatesAction({
        startDate: startDate ? startDate : null,
        endDate: endDate ? endDate : null,
        isDateConfirmed,
      });

      if (res.success) {
        setDateMessage({
          type: "success",
          text: isDateConfirmed
            ? "Festival dates saved & marked as CONFIRMED. The public website now displays the confirmed dates."
            : "Festival dates saved. Public status remains 'DATES TO BE ANNOUNCED' until confirmed.",
        });
      } else {
        setDateMessage({ type: "error", text: res.error || "Failed to update festival dates." });
      }
    });
  };

  const [themeTitle, setThemeTitle] = useState(initialContent.themeTitle);
  const [tagline, setTagline] = useState(initialContent.tagline);
  const [heroSupportingCopy, setHeroSupportingCopy] = useState(initialContent.heroSupportingCopy);
  const [college, setCollege] = useState(initialContent.college);
  const [department, setDepartment] = useState(initialContent.department);
  const [aboutIntro, setAboutIntro] = useState(initialContent.aboutIntro);
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(
    initialContent.aboutParagraphs.length > 0
      ? initialContent.aboutParagraphs
      : [
          "Hosted by the Department of Journalism at Maharaja Agrasen College, University of Delhi, YATHARTH is the annual national media festival uniting passionate collegiate journalists, photographers, designers, and storytellers from across India.",
        ]
  );
  const [contactEmail, setContactEmail] = useState(initialContent.contactEmail);
  const [contactPhone, setContactPhone] = useState(initialContent.contactPhone);
  const [contactAddress, setContactAddress] = useState(initialContent.contactAddress);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddParagraph = () => {
    setAboutParagraphs((prev) => [...prev, ""]);
  };

  const handleRemoveParagraph = (index: number) => {
    if (aboutParagraphs.length <= 1) {
      alert("At least one about paragraph must be maintained.");
      return;
    }
    setAboutParagraphs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveParagraph = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= aboutParagraphs.length) return;
    const updated = [...aboutParagraphs];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setAboutParagraphs(updated);
  };

  const handleUpdateParagraph = (index: number, text: string) => {
    const updated = [...aboutParagraphs];
    updated[index] = text;
    setAboutParagraphs(updated);
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const filteredParagraphs = aboutParagraphs
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (filteredParagraphs.length === 0) {
        setMessage({ type: "error", text: "At least one valid about paragraph is required." });
        return;
      }

      const res = await updateFestivalContentAction({
        themeTitle,
        tagline,
        heroSupportingCopy,
        college,
        department,
        aboutIntro,
        aboutParagraphs: filteredParagraphs,
        contactEmail,
        contactPhone,
        contactAddress,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: "Festival editorial content and contact information saved successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "Failed to update festival content.",
        });
      }
    });
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8F3025]" />
            <span>Festival Content &amp; Editorial</span>
          </h2>
          <p className="text-xs text-[#77716A] mt-1">
            Manage public messaging, taglines, hero copy, about narrative paragraphs, and institutional contacts.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDevelopment || isPending}
          onClick={handleSave}
          className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 rounded-xs"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save All Content &rarr;</span>
          )}
        </button>
      </div>

      {/* Status Feedback */}
      {message && (
        <div
          className={`p-4 border rounded-xs flex items-center gap-3 text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 0. Festival Dates & Confirmation Status */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8F3025]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Festival Dates &amp; Confirmation Status
            </h3>
          </div>
          <div>
            {isDateConfirmed ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-xs border border-emerald-500/30 text-emerald-400 bg-emerald-950/20 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Confirmed &bull; Publicly Visible</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-xs border border-amber-500/30 text-amber-400 bg-amber-950/20 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Dates to be Announced</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-[#77716A] leading-relaxed">
          Configure festival start and end dates. When &ldquo;Mark dates as confirmed&rdquo; is checked,
          the public website automatically switches from &ldquo;DATES TO BE ANNOUNCED&rdquo; to the formatted dates.
        </p>

        {dateMessage && (
          <div
            className={`p-3.5 border rounded-xs flex items-center gap-2.5 text-xs ${
              dateMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
            }`}
          >
            {dateMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{dateMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Festival Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Festival End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>
        </div>

        <div className="p-4 bg-black/40 border border-white/[0.06] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="flex items-start sm:items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDateConfirmed}
              onChange={(e) => setIsDateConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 sm:mt-0 accent-[#8F3025] rounded-xs cursor-pointer shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                Mark festival dates as confirmed
              </span>
              <span className="text-[11px] text-zinc-400 block font-sans mt-0.5">
                When unchecked, the public site displays &ldquo;DATES TO BE ANNOUNCED&rdquo; regardless of dates entered above.
              </span>
            </div>
          </label>

          <button
            type="button"
            disabled={!isDevelopment || isDatePending}
            onClick={handleSaveDates}
            className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 rounded-xs shrink-0 self-end sm:self-auto"
          >
            {isDatePending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Update Dates &rarr;</span>
            )}
          </button>
        </div>
      </div>

      {/* 1. Primary Festival Branding */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Sparkles className="w-4 h-4 text-[#8F3025]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Core Festival Identity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Festival Theme Title
            </label>
            <input
              type="text"
              value={themeTitle}
              onChange={(e) => setThemeTitle(e.target.value)}
              placeholder="e.g. Voice, Vision & Veracity"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
            <span className="text-[10px] text-zinc-500 font-mono block">
              Featured on the homepage hero, about headers, and identity ribbons.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Official Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. The Annual National Media & Journalism Festival"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
            <span className="text-[10px] text-zinc-500 font-mono block">
              Primary slogan under festival title.
            </span>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Hero Supporting Copy
            </label>
            <input
              type="text"
              value={heroSupportingCopy}
              onChange={(e) => setHeroSupportingCopy(e.target.value)}
              placeholder="e.g. Annual Festival • University of Delhi"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
            <span className="text-[10px] text-zinc-500 font-mono block">
              Secondary headline rendered in the hero scene.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Host College Name
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Maharaja Agrasen College, University of Delhi"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Host Academic Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Department of Journalism"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. About The Fest Narrative */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#8F3025]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. &quot;About The Fest&quot; Editorial Description
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddParagraph}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Paragraph</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
            Introductory Headline Statement
          </label>
          <input
            type="text"
            value={aboutIntro}
            onChange={(e) => setAboutIntro(e.target.value)}
            placeholder="e.g. A student-led celebration of creativity, competition, and courageous storytelling."
            className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
          />
        </div>

        {/* Dynamic Paragraph List */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
            Narrative Paragraphs ({aboutParagraphs.length})
          </label>

          {aboutParagraphs.map((paragraph, idx) => (
            <div
              key={idx}
              className="p-4 bg-black/40 border border-white/10 rounded-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Paragraph #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveParagraph(idx, "up")}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === aboutParagraphs.length - 1}
                    onClick={() => handleMoveParagraph(idx, "down")}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph(idx)}
                    className="p-1 text-rose-400/80 hover:text-rose-300 ml-2 cursor-pointer"
                    title="Remove Paragraph"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={paragraph}
                onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                placeholder="Write paragraph content..."
                className="w-full px-3.5 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs text-white rounded-xs font-sans leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Official Contact Details */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Mail className="w-4 h-4 text-[#8F3025]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Official Contact Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span>Contact Email</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="yatharth@mac.du.ac.in"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span>Contact Phone</span>
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98112 34567"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>Campus / Postal Address</span>
            </label>
            <input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Maharaja Agrasen College, Vasundhara Enclave, Delhi 110096"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
            />
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end">
        <button
          type="button"
          disabled={!isDevelopment || isPending}
          onClick={handleSave}
          className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 rounded-xs"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Content...</span>
            </>
          ) : (
            <span>Save All Content Changes &rarr;</span>
          )}
        </button>
      </div>
    </div>
  );
}
