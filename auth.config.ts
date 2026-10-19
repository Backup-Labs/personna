import type { NextAuthConfig } from "next-auth";

const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const signedIn = Boolean(auth?.user);
      const isLandingPage = request.nextUrl.pathname === "/";
      const onLoginPage = request.nextUrl.pathname === "/login";
      const onSignupPage = request.nextUrl.pathname === "/signup";
      const isPublicMetadata = ["/robots.txt", "/sitemap.xml"].includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/opengraph-image");
      if ((onLoginPage || onSignupPage) && signedIn) return Response.redirect(new URL("/dashboard", request.nextUrl));
      return isLandingPage || onLoginPage || onSignupPage || isPublicMetadata || signedIn;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
