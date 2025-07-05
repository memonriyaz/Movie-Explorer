export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import { auth } from "@/lib/auth-helper";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const user = await UserModel.findById(session.user.id).select("favorites");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      favorites: user.favorites || [],
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
