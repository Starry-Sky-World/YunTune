import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #d7d7d7 35%, #0a0a0a 100%)",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 88,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: -8,
          }}
        >
          YT
        </div>
      </div>
    ),
    size,
  );
}
