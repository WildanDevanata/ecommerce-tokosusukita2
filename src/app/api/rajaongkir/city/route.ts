// src/app/api/rajaongkir/cities/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(`https://api.rajaongkir.com/starter/city`, {
    headers: { key: process.env.RAJAONGKIR_API_KEY! }
  });
  const data = await response.json();
  return NextResponse.json(data.rajaongkir.results);
}