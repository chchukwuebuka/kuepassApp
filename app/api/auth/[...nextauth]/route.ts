import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { setAuthToken, setUserData, UserData } from "@/app/services/auth";

// Configure authentication options
const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // If we have an access_token, we can store it in the token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // You can implement custom logic here to sync with your backend
      try {
        if (user && user.email) {
          // Create a user object from Google profile data
          const userData: UserData = {
            username:
              user.name?.replace(/\s+/g, "").toLowerCase() ||
              user.email.split("@")[0],
            email: user.email,
            name: user.name || "",
            profile_url: user.image || undefined,
          };

          // When in client components, you need to handle this differently
          // This logic runs on the server - in client components you'd need to
          // dispatch actions after redirect
          if (typeof window !== "undefined") {
            setUserData(userData);
            if (account?.access_token) {
              setAuthToken(account.access_token);
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Still allow sign in even if our processing fails
      }
    },
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
  },
  session: {
    strategy: "jwt",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "your-fallback-secret-dont-use-this-in-production",
};

// Create and export the handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
