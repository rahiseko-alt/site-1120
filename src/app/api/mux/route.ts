import { NextRequest, NextResponse } from "next/server";

// Cache for refreshed Mux tokens per playback ID
let tokenCache: Record<string, { token: string; fetchedAt: number }> = {};

async function fetchLatestTokens(): Promise<Record<string, string>> {
  try {
    const res = await fetch("https://fromanother.love/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const html = await res.text();

    const matches = html.match(
      /https:\/\/stream\.mux\.com\/([a-zA-Z0-9_-]+)\.m3u8\?token=([a-zA-Z0-9._-]+)/g
    );
    const newTokens: Record<string, string> = {};
    if (matches) {
      for (const m of matches) {
        const parts = m.match(
          /https:\/\/stream\.mux\.com\/([a-zA-Z0-9_-]+)\.m3u8\?token=([a-zA-Z0-9._-]+)/
        );
        if (parts) {
          const [, id, token] = parts;
          newTokens[id] = token;
          tokenCache[id] = { token, fetchedAt: Date.now() };
        }
      }
    }
    return newTokens;
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (
    !parsed.hostname.endsWith(".mux.com") &&
    !parsed.hostname.endsWith(".fastly.mux.com")
  ) {
    return NextResponse.json({ error: "Disallowed host" }, { status: 403 });
  }

  const doFetch = async (fetchUrl: string) => {
    return fetch(fetchUrl, {
      headers: {
        Referer: "https://fromanother.love/",
        Origin: "https://fromanother.love",
        "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
      },
    });
  };

  let upstream = await doFetch(parsed.toString());

  // If 401 or 403, try auto-refreshing Mux token if it's a stream URL
  if ((upstream.status === 401 || upstream.status === 403) && parsed.hostname === "stream.mux.com") {
    const idMatch = parsed.pathname.match(/\/([a-zA-Z0-9_-]+)\.m3u8/);
    if (idMatch) {
      const id = idMatch[1];
      let cached = tokenCache[id];
      if (!cached || Date.now() - cached.fetchedAt > 60000) {
        await fetchLatestTokens();
        cached = tokenCache[id];
      }
      if (cached?.token) {
        parsed.searchParams.set("token", cached.token);
        upstream = await doFetch(parsed.toString());
      }
    }
  }

  if (!upstream.ok) {
    return new NextResponse(upstream.statusText, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";

  if (
    contentType.includes("mpegurl") ||
    parsed.pathname.endsWith(".m3u8")
  ) {
    const text = await upstream.text();
    const rewritten = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        if (trimmed.startsWith("#")) {
          return trimmed.replace(/URI="([^"]+)"/g, (_m, uri) => {
            const abs = new URL(uri, parsed).toString();
            return `URI="/api/mux?url=${encodeURIComponent(abs)}"`;
          });
        }
        const abs = new URL(trimmed, parsed).toString();
        return `/api/mux?url=${encodeURIComponent(abs)}`;
      })
      .join("\n");

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
