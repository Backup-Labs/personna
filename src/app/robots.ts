import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl().origin;
  return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] }, sitemap: `${baseUrl}/sitemap.xml` };
}
