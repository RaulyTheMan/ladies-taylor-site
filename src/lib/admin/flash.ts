// Appends a one-time success/status message to a redirect target so the
// client-side <Toast /> can show it after a Server Action's redirect(). The
// message never lands in server-rendered markup — it's read from the URL
// client-side and stripped immediately after, so it never persists across a
// manual refresh or gets bookmarked.
export function withFlash(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}flash=${encodeURIComponent(message)}`;
}
