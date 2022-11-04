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
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "My default title";

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
          <div tw="bg-gray-50 flex">
            <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
              <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
                <span>Ready to dive in? {title}</span>
                <span tw="text-indigo-600">Start your free trial today.</span>
              </h2>
              <div tw="mt-8 flex md:mt-0">
                <div tw="flex rounded-md shadow">
                  <a
                    href="#"
                    tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white"
                  >
                    Get started
                  </a>
                </div>
                <div tw="ml-3 flex rounded-md shadow">
                  <a
                    href="#"
                    tw="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
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
