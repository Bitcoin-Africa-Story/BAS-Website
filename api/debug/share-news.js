const FIREBASE_PROJECT_ID = "bas-website-75a3f";
const FIREBASE_API_KEY = "AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY";

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

module.exports = async (req, res) => {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  const post = await findNewsBySlug(slug);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    slug,
    found: !!post,
    post: post || { title: null, excerpt: null, image: null },
  });
};
