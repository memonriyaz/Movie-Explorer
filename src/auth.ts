// eslint-disable-next-line @typescript-eslint/no-require-imports
const NextAuth = require("next-auth").default;
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { loginUser } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import UserModel from "@/models/User";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await loginUser(credentials.email as string, credentials.password as string);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google") {
        try {
          await connectMongoDB();
          
          // Check if user already exists
          let existingUser = await UserModel.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = new UserModel({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId,
              favorites: [],
              // No password for Google OAuth users
            });
            
            existingUser = await newUser.save();
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            existingUser.googleId = account.providerAccountId;
            await existingUser.save();
          }
          
          // Update user object with database ID
          user.id = existingUser._id.toString();
          
          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
export { authOptions };
