import { Op } from "sequelize";
import { Document, AiSummary, getSequelize } from "~/server/models";
import { cacheGet, cacheSet } from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  getSequelize();

  const id = getRouterParam(event, "id")!;

  // Increment view count before cache check — always runs on every request
  Document.increment("viewCount", { where: { id } }).catch(() => {});

  const cacheKey = `public:doc:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const doc = await Document.findByPk(id, {
    include: [{ model: AiSummary, as: "summary", required: false }],
  });

  if (!doc) {
    throw createError({ statusCode: 404, message: "Dokumen tidak ditemukan" });
  }

  // Related documents: same type or ministry, exclude self
  const related = await Document.findAll({
    where: {
      id: { [Op.ne]: id },
      status: "indexed",
      [Op.or]: [
        { type: doc.type },
        ...(doc.ministry ? [{ ministry: doc.ministry }] : []),
      ],
    },
    limit: 4,
    order: [["published_at", "DESC"]],
    attributes: ["id", "title", "type", "ministry", "publishedAt"],
  });

  const summary = (doc as any).summary as AiSummary | null;

  const result = {
    document: doc,
    summary: summary?.summary ?? null,
    keyPoints: summary?.keyPoints ?? null,
    relatedDocuments: related,
  };

  await cacheSet(cacheKey, result, 3600);
  return result;
});
