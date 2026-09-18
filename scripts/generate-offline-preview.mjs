import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "yatharth-offline-preview");
const serverAppDir = path.join(rootDir, ".next", "server", "app");
const staticDir = path.join(rootDir, ".next", "static");
const publicAssetsDir = path.join(rootDir, "public", "assets");
const faviconPath = path.join(rootDir, "public", "favicon.ico");

console.log("=== YATHARTH '26: Generating Authentic Offline Preview ===");

// 1. Clean output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 2. Copy .next/static to yatharth-offline-preview/_next/static
const targetNextStatic = path.join(outDir, "_next", "static");
fs.mkdirSync(targetNextStatic, { recursive: true });
fs.cpSync(staticDir, targetNextStatic, { recursive: true });
console.log("✓ Copied Next.js static bundles & fonts to _next/static/");

// 3. Copy public/assets to yatharth-offline-preview/assets
const targetAssets = path.join(outDir, "assets");
fs.mkdirSync(targetAssets, { recursive: true });
fs.cpSync(publicAssetsDir, targetAssets, { recursive: true });
console.log("✓ Copied local media assets to assets/");

// 4. Copy favicon if exists
if (fs.existsSync(faviconPath)) {
  fs.copyFileSync(faviconPath, path.join(outDir, "favicon.ico"));
}

// 5. Define public pages to export
const pages = [
  { src: "index.html", dest: "index.html", depth: 0 },
  { src: "about.html", dest: "about.html", depth: 0 },
  { src: "announcements.html", dest: "announcements.html", depth: 0 },
  { src: "contact.html", dest: "contact.html", depth: 0 },
  { src: "events.html", dest: "events.html", depth: 0 },
  { src: "faculty.html", dest: "faculty.html", depth: 0 },
  { src: "gallery.html", dest: "gallery.html", depth: 0 },
  { src: "schedule.html", dest: "schedule.html", depth: 0 },
  { src: "sponsors.html", dest: "sponsors.html", depth: 0 },
  { src: "team.html", dest: "team.html", depth: 0 },
  { src: path.join("events", "khabar-e-tahqeeq.html"), dest: path.join("events", "khabar-e-tahqeeq.html"), depth: 1 },
  { src: path.join("events", "drishtikon.html"), dest: path.join("events", "drishtikon.html"), depth: 1 },
  { src: path.join("events", "bulletin-live.html"), dest: path.join("events", "bulletin-live.html"), depth: 1 },
  { src: path.join("events", "prasangik.html"), dest: path.join("events", "prasangik.html"), depth: 1 },
];

const headSnippet = `
<style>
@keyframes hidePreloader {
  0% { opacity: 1; visibility: visible; }
  80% { opacity: 1; }
  100% { opacity: 0; visibility: hidden; pointer-events: none; }
}
[aria-hidden="true"].fixed.z-\\[9999\\] {
  animation: hidePreloader 0.9s ease-out forwards;
}
img[src*="yatharth-wallpaper"] {
  opacity: 1 !important;
}
</style>
<script>
if (window.location.protocol === 'file:') {
  window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href]').forEach(function(anchor) {
      var href = anchor.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
        anchor.addEventListener('click', function(e) {
          e.stopPropagation();
        }, true);
      }
    });
  });
}
</script>
`;

for (const page of pages) {
  const sourceFile = path.join(serverAppDir, page.src);
  if (!fs.existsSync(sourceFile)) {
    console.error(`Missing pre-rendered source: ${sourceFile}`);
    continue;
  }

  let html = fs.readFileSync(sourceFile, "utf-8");

  // Determine prefix based on depth
  const prefix = page.depth === 0 ? "./" : "../";
  const siblingEventsPrefix = page.depth === 0 ? "./events/" : "./";

  // 1. Transform asset URLs
  html = html.replaceAll('href="/_next/', `href="${prefix}_next/`);
  html = html.replaceAll('src="/_next/', `src="${prefix}_next/`);
  html = html.replaceAll('href="/assets/', `href="${prefix}assets/`);
  html = html.replaceAll('src="/assets/', `src="${prefix}assets/`);
  html = html.replaceAll('href="/favicon.ico', `href="${prefix}favicon.ico`);

  // 2. Transform navigation routes to static HTML links
  // Event detail pages first
  html = html.replaceAll('href="/events/khabar-e-tahqeeq"', `href="${siblingEventsPrefix}khabar-e-tahqeeq.html"`);
  html = html.replaceAll('href="/events/drishtikon"', `href="${siblingEventsPrefix}drishtikon.html"`);
  html = html.replaceAll('href="/events/bulletin-live"', `href="${siblingEventsPrefix}bulletin-live.html"`);
  html = html.replaceAll('href="/events/prasangik"', `href="${siblingEventsPrefix}prasangik.html"`);

  // Standard top-level routes
  html = html.replaceAll('href="/"', `href="${prefix}index.html"`);
  html = html.replaceAll('href="/events"', `href="${prefix}events.html"`);
  html = html.replaceAll('href="/schedule"', `href="${prefix}schedule.html"`);
  html = html.replaceAll('href="/announcements"', `href="${prefix}announcements.html"`);
  html = html.replaceAll('href="/gallery"', `href="${prefix}gallery.html"`);
  html = html.replaceAll('href="/about"', `href="${prefix}about.html"`);
  html = html.replaceAll('href="/faculty"', `href="${prefix}faculty.html"`);
  html = html.replaceAll('href="/team"', `href="${prefix}team.html"`);
  html = html.replaceAll('href="/sponsors"', `href="${prefix}sponsors.html"`);
  html = html.replaceAll('href="/contact"', `href="${prefix}contact.html"`);

  // 3. Inject head snippet for seamless file:// fallback
  html = html.replace("</head>", `${headSnippet}</head>`);

  const destPath = path.join(outDir, page.dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, html, "utf-8");
  console.log(`✓ Processed ${page.dest}`);
}

// 6. Write START-PREVIEW.bat and START-PREVIEW.ps1
const psScript = `# YATHARTH 2026 Local Offline Preview Server
$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
} catch {
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  YATHARTH 2026 -- Official Offline Website Preview" -ForegroundColor Yellow
Write-Host "  Maharaja Agrasen College | Department of Journalism" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Serving at: $prefix" -ForegroundColor Green
Write-Host "Opening your default web browser..." -ForegroundColor Gray
Write-Host "Press Ctrl+C to close the preview server." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

Start-Process $prefix

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".txt"  = "text/plain; charset=utf-8"
}

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/" -or $rawPath -eq "") {
            $rawPath = "/index.html"
        }
        $filePath = [System.IO.Path]::Combine($baseDir, $rawPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar))

        if (-not (Test-Path $filePath -PathType Leaf)) {
            if (Test-Path "$filePath.html" -PathType Leaf) {
                $filePath = "$filePath.html"
            } elseif (Test-Path ([System.IO.Path]::Combine($filePath, "index.html")) -PathType Leaf) {
                $filePath = [System.IO.Path]::Combine($filePath, "index.html")
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # ignore context cancellation on exit
    }
}
`;

fs.writeFileSync(path.join(outDir, "START-PREVIEW.ps1"), psScript, "utf-8");

const batScript = `@echo off
title YATHARTH '26 - Offline Website Preview
echo Starting YATHARTH '26 offline preview...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0START-PREVIEW.ps1"
pause
`;

fs.writeFileSync(path.join(outDir, "START-PREVIEW.bat"), batScript, "utf-8");

// 7. Write README.txt
const readme = `================================================================================
YATHARTH '26 — OFFICIAL OFFLINE WEBSITE PREVIEW
Maharaja Agrasen College | Department of Journalism | University of Delhi
================================================================================

This portable package contains the complete public preview of the YATHARTH '26
festival website, built directly from the Next.js production application.

NO Node.js, npm, database, Supabase, or active internet connection is required.
All styles, fonts (Cinzel, Montserrat, Graduate, Geist), logos, wallpaper,
posters, and gallery images are bundled locally.

--------------------------------------------------------------------------------
HOW TO VIEW THE WEBSITE:
--------------------------------------------------------------------------------

OPTION 1: RECOMMENDED (Full Interactive Next.js Experience)
  1. Double-click "START-PREVIEW.bat" in this folder.
  2. The website will immediately launch in your default web browser
     (Chrome / Edge / Firefox) at http://localhost:8080.
  3. All interactive features are fully active:
     - Navigation menu with sliding drawer
     - Interactive schedule filter tabs (Day 01 / Day 02)
     - Competition detail pages with posters and rulebooks
     - Faculty section with Principal, HOD, and Faculty Mentors
     - Gallery showcase and photo preview
     - Announcements and official notices
     - Organizing team leadership directory
     - Wallpaper background and theme tokens

OPTION 2: DIRECT BROWSING (Standard Static HTML)
  1. Double-click "index.html" to open the website directly in any browser.
  2. You can browse all pages, read content, view posters, and inspect
     the design directly via local files.

--------------------------------------------------------------------------------
WEBSITE DIRECTORY:
--------------------------------------------------------------------------------
- Home:            index.html
- About:           about.html
- Events:          events.html
  * Khabar-e-Tahqeeq:  events/khabar-e-tahqeeq.html
  * Drishtikon:        events/drishtikon.html
  * Bulletin Live:     events/bulletin-live.html
  * Prasangik:         events/prasangik.html
- Faculty:         faculty.html  (Principal, HOD, Faculty Mentors)
- Organizing Team: team.html     (Student Coordinators & Competition Leads)
- Schedule:        schedule.html (Programme Timeline)
- Announcements:   announcements.html
- Gallery:         gallery.html
- Sponsors:        sponsors.html
- Contact:         contact.html

================================================================================
`;

fs.writeFileSync(path.join(outDir, "README.txt"), readme, "utf-8");

console.log("✓ Created START-PREVIEW.bat, START-PREVIEW.ps1, and README.txt");
console.log("=== Offline preview generation completed successfully! ===");
