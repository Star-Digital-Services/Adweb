import { NextRequest, NextResponse } from "next/server";

import { requireSetAccess } from "@/lib/middleware-auth";

import {

  generateSignedUrlsForPhotos,

  listPhotosInSet,

} from "@/lib/s3";

import { getSetById } from "@/config/sets";



export const dynamic = "force-dynamic";



export async function GET(request: NextRequest) {

  try {

    const setId = request.nextUrl.searchParams.get("setId");



    if (!setId) {

      return NextResponse.json(

        { error: "setId query parameter is required" },

        { status: 400 }

      );

    }



    const photoSet = getSetById(setId);

    if (!photoSet) {

      return NextResponse.json({ error: "Photo set not found" }, { status: 404 });

    }



    const auth = await requireSetAccess(request, setId);

    if (auth.error) return auth.error;



    const photos = await listPhotosInSet(photoSet.s3Prefix);

    const signedPhotos = await generateSignedUrlsForPhotos(photos);



    return NextResponse.json({

      setId,

      photos: signedPhotos.map(({ key, title, signedUrl, expiresIn }) => ({

        id: key,

        title,

        signedUrl,

        expiresIn,

      })),

    });

  } catch (error) {

    console.error("Photos error:", error);

    return NextResponse.json(

      { error: "Failed to load protected content" },

      { status: 500 }

    );

  }

}

