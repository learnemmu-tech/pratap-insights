export function youtubeIdFromUrl(input: string) {
  const value = input.trim();
  if (!value) return "";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  let id = "";
  if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? "";
  else if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] ?? "";
    else id = url.searchParams.get("v") ?? "";
  } else return null;
  return /^[\w-]{11}$/.test(id) ? id : null;
}
