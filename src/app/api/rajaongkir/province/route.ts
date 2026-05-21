import { NextResponse } from "next/server";
import { getProvinces } from "@/lib/rajaongkir";

export async function GET() {
  const provinces = await getProvinces();

  return NextResponse.json(provinces);
}