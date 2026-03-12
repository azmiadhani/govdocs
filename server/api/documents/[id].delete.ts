import { Document, getSequelize } from "~/server/models";
import { requireRole } from "~/server/utils/auth";
import { deleteFile } from "~/server/utils/storage";
import { invalidateDocumentCaches } from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  await requireRole(event, "admin");
  getSequelize();

  const id = getRouterParam(event, "id");

  const doc = await Document.findByPk(id);
  if (!doc)
    throw createError({ statusCode: 404, message: "Document not found" });

  await deleteFile(doc.filePath);

  // Cascade deletes chunks + summary via DB constraints
  await doc.destroy();

  await invalidateDocumentCaches(id, true);

  return { ok: true };
});
