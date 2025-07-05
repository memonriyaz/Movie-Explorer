import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import type { Session } from "next-auth";

export const auth = (): Promise<Session | null> => getServerSession(authOptions);
