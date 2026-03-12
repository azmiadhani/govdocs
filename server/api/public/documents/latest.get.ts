import { Document, AiSummary, getSequelize } from "~/server/models";

export default defineEventHandler(async () => {
  getSequelize();

  const documents = await Document.findAll({
    where: { status: "indexed" },
    include: [{ model: AiSummary, as: "summary", required: false }],
    order: [["createdAt", "DESC"]],
    limit: 6,
    attributes: [
      "id",
      "title",
      "type",
      "ministry",
      "pageCount",
      "viewCount",
      "publishedAt",
      "createdAt",
    ],
  });

  return documents.map((d) => d.toJSON());
});
