"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { BarChart2, ImagePlus, Loader2, Type } from "lucide-react";
import { transmitPost, type TransmitPostState } from "@/app/actions/posts";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { cn, stripCodeFences, triggerHaptic } from "@/src/lib/utils";

const initialPostState: TransmitPostState = {};

type Mode = "image" | "text";

const modeOptions: { key: Mode; label: string; hint: string }[] = [
  { key: "image", label: "IMAGE PAYLOAD", hint: "Photo transmission with caption" },
  { key: "text", label: "TEXT PAYLOAD", hint: "Share a thought, update, or code snippet" },
];

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  const label =
    mode === "text" ? "INITIATE TEXT TRANSMISSION" : "INITIATE TRANSMISSION";
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 ease-out hover:border-zinc-600 hover:bg-zinc-800 focus-visible:border-cyan-400 focus-visible:outline-none active:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin text-cyan-400" />
          <span className="text-zinc-200">Transmitting...</span>
        </>
      ) : (
        <span className="text-cyan-400">{label}</span>
      )}
    </button>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const tabs: { key: Mode; label: string }[] = [
    { key: "text", label: "[ TEXT ]" },
    { key: "image", label: "[ IMAGE ]" },
  ];
  return (
    <div className="grid grid-cols-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1 backdrop-blur-xl">
      {tabs.map((tab) => {
        const active = mode === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={
              active
                ? "rounded-xl bg-zinc-800 px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 transition-all duration-200 ease-out"
                : "rounded-xl px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-all duration-200 ease-out hover:text-zinc-200"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ImageUploadForm() {
  const [state, formAction] = useActionState(transmitPost, initialPostState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
    } else {
      setPreviewUrl(null);
      setFileName(null);
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) {
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }
      handleFileChange(file);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-xl">
      <div className="mb-4 border-b border-zinc-800 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          System Transmission // Image Payload
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Select image asset and attach data payload for uplink.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value="image" />
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Image_Payload
          </p>
          <label
            htmlFor="image"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative flex min-h-60 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-4 text-center transition-all duration-200 ease-out hover:border-zinc-600 hover:bg-zinc-900"
          >
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected transmission preview"
                  className="max-h-72 w-full border border-zinc-800 object-contain"
                />
                <span className="mt-3 block w-full truncate font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
                  Loaded: {fileName}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  Click or drop to replace
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-zinc-400">
                <ImagePlus
                  size={32}
                  strokeWidth={1.6}
                  className="text-zinc-500 transition-colors duration-200 ease-out group-hover:text-zinc-300"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                    Drop Image Signal
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                    or click to select payload
                  </p>
                </div>
                <p className="font-mono text-[10px] text-zinc-600">
                  ACCEPTED: image/* // target bucket: uplink-posts
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Caption/Data Payload
          </span>
          <textarea
            name="caption"
            rows={4}
            placeholder="ENTER TRANSMISSION TEXT..."
            className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-sm leading-relaxed text-zinc-100 outline-none transition-all duration-200 ease-out placeholder:text-zinc-600 focus:border-cyan-400"
          />
        </label>

        {state?.error ? (
          <div
            role="alert"
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-xs text-red-400"
          >
            {state.error}
          </div>
        ) : null}

        <SubmitButton mode="image" />
      </form>
    </div>
  );
}

const POST_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "question", label: "Question" },
  { value: "hiring", label: "Hiring" },
  { value: "showdev", label: "ShowDev" },
] as const;

const CODE_LANGUAGES = [
  "tsx",
  "ts",
  "jsx",
  "js",
  "python",
  "rust",
  "go",
  "sql",
  "bash",
  "json",
  "text",
];

function TextUploadForm() {
  const [state, formAction] = useActionState(transmitPost, initialPostState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [isCodeBlock, setIsCodeBlock] = useState(false);
  const [language, setLanguage] = useState("tsx");
  const [category, setCategory] = useState<string>("general");
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const togglePoll = () => {
    triggerHaptic();
    if (pollEnabled) {
      setPollEnabled(false);
      return;
    }
    if (isCodeBlock) {
      setIsCodeBlock(false);
      setBody((value) => stripCodeFences(value));
    }
    setPollOptions((options) =>
      options.length >= 2 ? options : ["", ""],
    );
    setPollEnabled(true);
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions((options) =>
      options.map((option, i) => (i === index ? value : option)),
    );
  };

  const addPollOption = () => {
    triggerHaptic();
    setPollOptions((options) => (options.length < 4 ? [...options, ""] : options));
  };

  const removePollOption = (index: number) => {
    triggerHaptic();
    setPollOptions((options) =>
      options.length > 2 ? options.filter((_, i) => i !== index) : options,
    );
  };

  const enableCodeBlock = () => {
    triggerHaptic();
    if (pollEnabled) {
      setPollEnabled(false);
    }
    setIsCodeBlock(true);
    const el = textareaRef.current;
    if (!el || body.includes("```")) return;

    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const selected = body.slice(start, end);
    const prefix = "```" + language + "\n";
    const suffix = "\n```";

    setBody(body.slice(0, start) + prefix + selected + suffix + body.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + prefix.length + selected.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const disableCodeBlock = () => {
    triggerHaptic();
    setIsCodeBlock(false);
    setBody((value) => stripCodeFences(value));
  };

  const changeLanguage = (next: string) => {
    setLanguage(next);
    setBody((value) => value.replace(/^```[^\r\n]*/, "```" + next));
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-xl">
      <div className="mb-4 border-b border-zinc-800 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          System Transmission // Text Payload
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Broadcast a text signal or a code snippet to the grid.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value="text" />
        <input
          type="hidden"
          name="is_code_block"
          value={isCodeBlock ? "true" : "false"}
        />
        <input
          type="hidden"
          name="language"
          value={isCodeBlock ? language : ""}
        />
        <input type="hidden" name="category" value={category} />

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-300">Category</p>
          <div className="flex flex-wrap gap-2">
            {POST_CATEGORIES.map((option) => {
              const active = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setCategory(option.value);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                      : "border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="block">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              <Type size={12} /> &gt; Text_Payload
            </span>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={enableCodeBlock}
                  aria-pressed={isCodeBlock}
                  title="Wrap selection in a code block"
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px] transition-colors",
                    isCodeBlock
                      ? "bg-cyan-400 text-zinc-950"
                      : "text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  &lt;/&gt;
                </button>
                {isCodeBlock ? (
                  <>
                    <select
                      aria-label="Code language"
                      value={language}
                      onChange={(event) => changeLanguage(event.target.value)}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-1 font-mono text-[10px] text-zinc-300 outline-none focus:border-cyan-400"
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={disableCodeBlock}
                      className="rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-400 transition-colors hover:text-zinc-100"
                    >
                      Plain
                    </button>
                  </>
                ) : null}
              </span>
              <button
                type="button"
                onClick={togglePoll}
                aria-pressed={pollEnabled}
                title="Add a poll"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40",
                  pollEnabled
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-cyan-400",
                )}
              >
                <BarChart2 size={14} strokeWidth={1.8} />
                Poll
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            name="body"
            aria-label="Post body"
            rows={7}
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={
              isCodeBlock ? "Paste or write your snippet..." : "What's happening in the grid?"
            }
            className={cn(
              "w-full resize-y border-0 bg-transparent px-0 py-2 text-[15px] leading-relaxed text-zinc-100 outline-none transition-all duration-200 ease-out placeholder:text-zinc-600 focus:ring-0",
              isCodeBlock &&
                "rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-sm",
            )}
          />
        </div>

        {pollEnabled ? (
          <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <input type="hidden" name="poll_enabled" value="true" />
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                Poll options // {pollOptions.length}/4
              </span>
              <button
                type="button"
                onClick={togglePoll}
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500 transition-colors hover:text-zinc-200"
              >
                Remove poll
              </button>
            </div>

            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-5 flex-shrink-0 font-mono text-[10px] text-zinc-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <input
                  name="pollOptions"
                  value={option}
                  onChange={(event) => updatePollOption(index, event.target.value)}
                  maxLength={120}
                  placeholder={`Option ${index + 1}`}
                  aria-label={`Poll option ${index + 1}`}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400"
                />
                {index >= 2 ? (
                  <button
                    type="button"
                    onClick={() => removePollOption(index)}
                    className="flex-shrink-0 rounded-lg border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}

            {pollOptions.length < 4 ? (
              <button
                type="button"
                onClick={addPollOption}
                className="rounded-lg border border-dashed border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-400"
              >
                + Add option
              </button>
            ) : null}
          </div>
        ) : null}

        {!isCodeBlock ? (
          <label className="block border-t border-zinc-800 pt-4">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              &gt; Attach Link (optional)
            </span>
            <input
              name="link"
              type="url"
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none transition-all duration-200 ease-out placeholder:text-zinc-600 focus:border-cyan-400"
            />
          </label>
        ) : null}

        {state?.error ? (
          <div
            role="alert"
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-xs text-red-400"
          >
            {state.error}
          </div>
        ) : null}

        <SubmitButton mode="text" />
      </form>
    </div>
  );
}

export function UploadClient() {
  const [mode, setMode] = useState<Mode>("text");
  const [optionsOpen, setOptionsOpen] = useState(false);

  const chooseMode = (next: Mode) => {
    triggerHaptic();
    setMode(next);
    setOptionsOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Select payload
        </p>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setOptionsOpen(true);
          }}
          className="border border-zinc-800 bg-[#0a0a0a] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-cyan-400"
        >
          Upload options
        </button>
      </div>

      <ModeToggle mode={mode} onChange={chooseMode} />
      {mode === "image" ? <ImageUploadForm /> : null}
      {mode === "text" ? <TextUploadForm /> : null}

      <BottomSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        title="Upload options"
      >
        <div className="flex flex-col p-2">
          {modeOptions.map((option) => {
            const Icon = option.key === "image" ? ImagePlus : Type;
            const active = mode === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => chooseMode(option.key)}
                className={`flex items-center gap-3 border-b border-zinc-800 px-3 py-4 text-left transition-colors last:border-b-0 ${
                  active ? "text-cyan-400" : "text-zinc-200 hover:text-cyan-400"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1">
                  <span className="block text-sm uppercase tracking-[0.12em]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-zinc-500">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
