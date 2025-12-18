import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  (await cookies()).set("__session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Solo en producción
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 día
    path: "/",
  });

  return NextResponse.json({ status: "ok" });
}