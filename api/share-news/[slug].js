const FIREBASE_PROJECT_ID = "bas-website-75a3f";
const FIREBASE_API_KEY = "AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY";

function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(url = "", origin = "") {
  if (!url) return `${origin}/assets/BASLOGOSmall.png`;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}

function pickString(fields = {}, key = "") {
  return fields?.[key]?.stringValue || "";
}

async function findNewsBySlug(slug) {
  const runQueryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "news" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "slug" },
          op: "EQUAL",
          value: { stringValue: slug },
        },
      },
      limit: 1,
    },
  };

  const response = await fetch(runQueryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queryBody),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const doc = data.find((item) => item.document)?.document;
  if (!doc) return null;

  return {
    title: pickString(doc.fields, "title"),
    excerpt: pickString(doc.fields, "excerpt"),
    image: pickString(doc.fields, "image"),
  };
}

async function findNewsById(id) {
  const docUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/news/${encodeURIComponent(id)}?key=${FIREBASE_API_KEY}`;
  const response = await fetch(docUrl);
  if (!response.ok) return null;
  const doc = await response.json();
  if (!doc?.fields) return null;

  return {
    title: pickString(doc.fields, "title"),
    excerpt: pickString(doc.fields, "excerpt"),
    image: pickString(doc.fields, "image"),
  };
}

module.exports = async (req, res) => {
  const host = req.headers.host || "bitcoinafricastory.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  const slugOrId =
    (req.query && typeof req.query.slug === "string" && req.query.slug) ||
    (Array.isArray(req.query?.slug) ? req.query.slug[0] : "");

  if (!slugOrId) {
    res.status(302).setHeader("Location", `${origin}/news`);
    res.end();
    return;
  }

  const postUrl = `${origin}/news/${encodeURIComponent(slugOrId)}`;
  const shareUrl = `${origin}/api/share-news/${encodeURIComponent(slugOrId)}`;

  let post = await findNewsBySlug(slugOrId);
  if (!post) {
    post = await findNewsById(slugOrId);
  }

  const title = escapeHtml(post?.title || "Bitcoin Africa Story");
  const description = escapeHtml(post?.excerpt || "Bitcoin Africa Story news");
  const image = escapeHtml(toAbsoluteUrl(post?.image || "", origin));
  const safePostUrl = escapeHtml(postUrl);
  const safeShareUrl = escapeHtml(shareUrl);

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
    <link rel="canonical" href="${safePostUrl}" />
    <meta property="og:url" content="${safePostUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safePostUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <script>window.location.replace("${safePostUrl}");</script>
  </head>
  <body>Redirecting...</body>
</html>`);
};
