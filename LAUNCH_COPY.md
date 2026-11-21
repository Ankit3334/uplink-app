# UPLINK // Launch Copy

## Product Hunt

**Headline:**  
UPLINK: The terminal-style, privacy-focused alternative to Instagram

**Body:**  
Social media started as a way to share moments. Now it’s a polished slot machine—algorithmic feeds, engagement traps, and the same sterile UI everywhere you look.

**UPLINK is a different signal.**

It’s a terminal-style, privacy-focused alternative to Instagram: a raw, chronological data stream where posts are *transmissions*, likes are *BOOSTs*, and comments are *THREADs*. No black-box algorithm deciding what you should see next. No infinite beige feed. Just a sharp cyberpunk interface—neon accents, monospace metadata, scanlines, and zero rounded corners—built to make sharing feel intentional again.

Under the hood, UPLINK is built with Next.js and Supabase for a fast, straightforward experience: image uplinks, profiles, boosts, threads, and a feed that moves in time order.

If you’re tired of sterile, algorithm-driven social media, plug into UPLINK and transmit something real. I’d love your feedback on what to build next.

---

## Hacker News (Show HN)

**Title:**  
Show HN: UPLINK – A cyberpunk-inspired, open-feeling social network built with Next.js and Supabase

**Body:**  
Hi HN — I built **UPLINK**, an experiment in making a social feed feel raw again: a chronological stream of image “transmissions” with boosts, threads, and user profiles, styled like a hacker terminal (deep black UI, neon accents, monospace type, sharp corners, scanlines).

**Tech stack/build:** Next.js (App Router) + TypeScript + Tailwind on the frontend, with Supabase handling auth, Postgres (RLS), and storage. Most mutations run through Server Actions (upload/boost/thread/profile updates), and protected routes gate access/onboarding based on session + profile state.

**Design challenge:** the hardest part was making a “hacker UI” actually usable on mobile. High-contrast neon can become noisy, monospace reduces scanability, and fixed elements (bottom nav, thread composer) compete with small screens and keyboards. I tried to balance vibe with clarity using consistent hierarchy, restrained glow/borders, and keeping core interactions readable and tappable.

I’d really appreciate feedback on the UX: where the aesthetic helps or hurts, what feels confusing on mobile, and what you’d simplify or push further.
