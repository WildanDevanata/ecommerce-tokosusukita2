import { NextRequest, NextResponse } from "next/server";
import { searchDestination } from "@/lib/rajaongkir";


export async function POST(req: NextRequest) {

  try {

    const body = await req.json();


    if (!body.keyword) {
      return NextResponse.json(
        {
          success: false,
          message: "Keyword wajib diisi"
        },
        {
          status:400
        }
      );
    }


    const data =
      await searchDestination(
        body.keyword
      );


    return NextResponse.json({
      success:true,
      data
    });


  } catch(error) {

    console.error(
      "DESTINATION API ERROR",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:"Gagal mencari destination"
      },
      {
        status:500
      }
    );
  }
}