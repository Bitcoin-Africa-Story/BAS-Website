function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(url = "", origin = "") {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (!origin) return url;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}

module.exports = (req, res) => {
  const host = req.headers.host || "bitcoinafricastory.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  const rawUrl = typeof req.query.url === "string" ? req.query.url : `${origin}/news`;
  const rawTitle = typeof req.query.title === "string" ? req.query.title : "Bitcoin Africa Story";
  const rawDescription = typeof req.query.description === "string" ? req.query.description : "Bitcoin Africa Story news";
  const rawImage = typeof req.query.image === "string" ? req.query.image : "";

  const canonicalUrl = escapeHtml(toAbsoluteUrl(rawUrl, origin));
  const title = escapeHtml(rawTitle);
  const description = escapeHtml(rawDescription);
  const image = escapeHtml(toAbsoluteUrl(rawImage, origin));

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <script>window.location.replace("${canonicalUrl}");</script>
  </head>
  <body>Redirecting...</body>
</html>`);
};
