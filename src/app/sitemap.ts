import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return ["", "/login", "/signup"].map(path => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency: path ? "monthly" : "weekly", priority: path ? 0.5 : 1 }));
}
