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
    const subTitle = hasTitle
      ? searchParams.get("subTitle")?.slice(0, 100)
      : "My default title";

    const hasQuery = searchParams.has("query");
    const query = hasQuery
      ? searchParams.get("query")?.slice(0, 100)
      : "My default query";

    return new ImageResponse(
      (
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
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1 style={{ fontSize: "64px", textAlign: "center" }}>
              Confessional Christianity
            </h1>
            <p
              style={{
                display: "flex",
                flexWrap: "wrap",
                textAlign: "center",
                justifySelf: "center",
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                fontSize: "48px",
              }}
            >
              {subTitle}
            </p>
            {hasQuery && (
              <p
                style={{
                  padding: "0 1.5px",
                  fontSize: "36px",
                  fontStyle: "italic",
                }}
              >
                {query}
              </p>
            )}
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
        headers: {
          "content-type": "image/png",
          "cache-control": "no-cache",
        },
      }
    );
  } catch (e) {
    throw e;
  }
}
