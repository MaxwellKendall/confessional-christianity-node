import React from "react";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

// Make sure the font exists in the specified path:
const font = fetch(
  // new URL("../../assets/Cinzel-VariableFont_wght.ttf", import.meta.url)
  new URL("../../assets/Cinzel-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function (req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fontData = await font;
    const hasTitle = searchParams.has("subTitle");
    const title = hasTitle
      ? searchParams.get("subTitle")?.slice(0, 100)
      : "My default title";

    const hasQuery = searchParams.has("query");
    const query = hasQuery
      ? searchParams.get("query")?.slice(0, 100)
      : "My default query";

    return new ImageResponse(
      (
        // Modified based on https://tailwindui.com/components/marketing/sections/cta-sections
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            fontFamily: "Cinzel",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <div tw="mx-auto flex flex-col w-full justify-center items-center">
            <h1 tw="text-3xl sm:text-4xl font-bold tracking-tight text-center w-full">
              Confessional Christianity
            </h1>
            <h2 tw="w-full text-center py-2">Classical Protestantism</h2>
            <p tw="w-full text-center py-5">{title}</p>
            {query && <p tw="w-full text-center py-5">{`on ${query}`}</p>}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Cinzel",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    throw e;
  }
}
