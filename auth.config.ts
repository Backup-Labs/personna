import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const signedIn = Boolean(auth?.user);
      const onLoginPage = request.nextUrl.pathname === "/login";
      if (onLoginPage && signedIn) return Response.redirect(new URL("/", request.nextUrl));
      return onLoginPage || signedIn;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
