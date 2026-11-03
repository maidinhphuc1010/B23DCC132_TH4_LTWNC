import type { Metadata } from "next";

// Configure the public origin at build time; never derive canonical URLs from request headers.
export const siteUrl = new URL(process.env.SITE_URL || "http://localhost:3000");
if (!["http:", "https:"].includes(siteUrl.protocol)) throw new Error("SITE_URL must be an HTTP(S) URL");
export const absoluteUrl = (path: string) => new URL(path, siteUrl.origin).href;
export const privateMetadata: Metadata = { robots: { index: false, follow: false } };

export function publicMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path), siteName: "Class Deadline Hub", locale: "vi_VN", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
