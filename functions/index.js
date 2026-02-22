const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const SITE_URL = "https://bitcoinafricastory.com";
const FALLBACK_IMAGE = `${SITE_URL}/assets/BASLOGOSmall.png`;
const FALLBACK_TITLE = "Bitcoin Africa Story - Bitcoin News, Education & Community in Africa";
const FALLBACK_DESCRIPTION =
  "Bitcoin Africa Story is a trusted source of news, insights, and narratives on Bitcoin adoption, innovation, and impact across the African continent.";

function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(url = "") {
  if (!url) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
}

async function getNewsBySlugOrId(slugOrId) {
  if (!slugOrId) return null;

  const bySlug = await db
    .collection("news")
    .where("slug", "==", slugOrId)
    .limit(1)
    .get();

  if (!bySlug.empty) {
    const doc = bySlug.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  const byId = await db.collection("news").doc(slugOrId).get();
  if (byId.exists) {
    return { id: byId.id, ...byId.data() };
  }

  return null;
}

exports.newsMeta = onRequest(async (req, res) => {
  try {
    const pathParts = req.path.split("/").filter(Boolean);
    const newsIndex = pathParts.indexOf("news");
    const slugOrId = newsIndex >= 0 ? pathParts[newsIndex + 1] : null;

    if (!slugOrId) {
      res.redirect(302, `${SITE_URL}/news`);
      return;
    }

    const post = await getNewsBySlugOrId(slugOrId);
    const postPath = `/news/${slugOrId}`;
    const canonicalUrl = `${SITE_URL}${postPath}`;

    const title = escapeHtml(post?.title || FALLBACK_TITLE);
    const description = escapeHtml(post?.excerpt || FALLBACK_DESCRIPTION);
    const image = escapeHtml(toAbsoluteUrl(post?.image));

    // Keep this short so social scrapers can refresh as new posts update.
    res.set("Cache-Control", "public, max-age=60, s-maxage=60");
    res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Bitcoin Africa Story" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

    <script>
      window.location.replace("${canonicalUrl}");
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>`);
  } catch (error) {
    console.error("newsMeta failed", error);
    res.redirect(302, `${SITE_URL}/news`);
  }
});
