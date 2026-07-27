import { NextRequest, NextResponse } from "next/server";
import { calculateCost } from "@/lib/rajaongkir";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const originId = "40102"; // Toko di Magetan

    if (!body.destination) {
      return NextResponse.json(
        { success: false, message: "Destination is required" },
        { status: 400 }
      );
    }

    const results = await calculateCost({
      origin: originId,
      destination: String(body.destination),
      courier: body.courier,
      weight: Number(body.weight),
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}