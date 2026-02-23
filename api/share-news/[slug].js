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

function pickString(fields = {}, ...keys) {
  for (const key of keys) {
    const val = fields?.[key]?.stringValue;
    if (val) return val;
  }
  return "";
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
    excerpt: pickString(doc.fields, "excerpt", "description"),
    image: pickString(doc.fields, "image", "imageUrl", "image_url", "featuredImage", "thumbnail"),
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
    excerpt: pickString(doc.fields, "excerpt", "description"),
    image: pickString(doc.fields, "image", "imageUrl", "image_url", "featuredImage", "thumbnail"),
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
  const image = toAbsoluteUrl(post?.image || "", origin); // Don't escape the URL, just make it absolute
  const safePostUrl = escapeHtml(postUrl);
  const safeShareUrl = escapeHtml(shareUrl);
  const safeTitle = escapeHtml(title); // Double-escape to avoid issues
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image); // Only escape for HTML attribute safety

  // LOG for debugging
  console.log(`[share-news] slug: ${slugOrId}, post found: ${!!post}, image raw: ${post?.image}, image final: ${image}`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <meta property="og:type" content="article" />
    <link rel="canonical" href="${safePostUrl}" />
    <meta property="og:url" content="${safePostUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safePostUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
  </head>
  <body>
    <p>Redirecting to article...</p>
    <script>window.location.replace("${safePostUrl}");</script>
  </body>
</html>`);
};
