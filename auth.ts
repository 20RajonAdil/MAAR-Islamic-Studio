import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Reads AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and AUTH_SECRET from environment variables.
export const { handlers, auth, signIn, signOut } = NextAuth({ providers: [Google], trustHost: true });
