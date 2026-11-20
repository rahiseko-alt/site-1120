import { NextRequest, NextResponse } from "next/server";

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

  if (!parsed.hostname.endsWith(".mux.com") && !parsed.hostname.endsWith(".fastly.mux.com")) {
    return NextResponse.json({ error: "Disallowed host" }, { status: 403 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: {
      Referer: "https://fromanother.love/",
      Origin: "https://fromanother.love",
      "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
    },
  });

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
          // Rewrite URI="..." inside EXT-X-MEDIA / EXT-X-MAP etc.
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
