"use client";

// global-error replaces the root layout entirely when the layout itself
// throws, so it renders its own <html>/<body> and can't rely on
// globals.css or the fonts loaded in layout.tsx being available — hence
// plain inline styles instead of Tailwind classes here.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#FFCE00",
          color: "#000",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            border: "2px solid #000",
            boxShadow: "6px 6px 0 0 #000",
            borderRadius: "20px",
            background: "#FF001E",
            padding: "2.5rem 1.5rem",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Error
          </p>
          <h1
            style={{
              margin: "0.5rem 0 0",
              fontSize: "2rem",
              fontWeight: 500,
              color: "#fff",
            }}
          >
            Something went wrong
          </h1>
        </div>

        <p style={{ maxWidth: "32rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
          That&apos;s on us, not you. Please try again.
        </p>

        <button
          onClick={() => unstable_retry()}
          style={{
            border: "2px solid #000",
            boxShadow: "3px 3px 0 0 #000",
            borderRadius: "14px",
            background: "#202224",
            color: "#fff",
            padding: "0.65rem 1.5rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
