import { NextRequest, NextResponse } from "next/server";

import { calculateCost } from "@/lib/rajaongkir";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
// Ensure IDs are strings containing numbers, not names
    const originId = "123"; // REPLACE with your actual store city ID (as a string)
    const destinationId = body.destination; // Expecting the ID from frontend

    const results = await calculateCost({
      origin: originId,
      destination: destinationId, 
      courier: body.courier,
      weight: body.weight,
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