import {
  Document,
  DocumentChunk,
  AiSummary,
  getSequelize,
} from "~/server/models";
import { requireRole } from "~/server/utils/auth";
import { extractPdfText } from "~/server/utils/pdf";
import { chunkText } from "~/server/utils/chunker";
import { embedTexts } from "~/server/utils/embeddings";
import {
  cacheDel,
  cacheSet,
  invalidateDocumentCaches,
} from "~/server/utils/redis";
import { callClaude, buildSummarizationPrompt } from "~/server/utils/claude";

const MODEL = "gpt-4o-mini";

export default defineEventHandler(async (event) => {
  await requireRole(event, "admin");
  getSequelize();

  const { documentId } = await readBody(event);
  if (!documentId)
    throw createError({ statusCode: 400, message: "documentId is required" });

  const doc = await Document.findByPk(documentId);
  if (!doc)
    throw createError({ statusCode: 404, message: "Document not found" });

  // Reset status
  await doc.update({ status: "pending" });

  // Delete existing chunks and summary
  await DocumentChunk.destroy({ where: { documentId } });
  await AiSummary.destroy({ where: { documentId } });
  await cacheDel(`summary:${documentId}`);

  // Re-ingest
  const { text, pageCount } = await extractPdfText(doc.filePath);
  await doc.update({ pageCount });

  const chunks = chunkText(text);

  const EMBED_BATCH_SIZE = 100;
  const embeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE).map((c) => c.content);
    embeddings.push(...(await embedTexts(batch)));
  }

  await DocumentChunk.bulkCreate(
    chunks.map((chunk, i) => ({
      documentId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      embedding: `[${embeddings[i].join(",")}]` as any,
    })),
  );

  await doc.update({ status: "indexed" });
  await invalidateDocumentCaches(documentId, true);

  // Generate summary after re-indexing
  try {
    const truncatedText = text.slice(0, 100_000);
    const response = await callClaude(
      buildSummarizationPrompt(),
      `Tolong analisis dokumen berikut:\n\n${truncatedText}`,
      4096,
    );
    let summaryText: string;
    let keyPoints: string[];
    try {
      const jsonText = response
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
      const parsed = JSON.parse(jsonText);
      summaryText = parsed.summary;
      keyPoints = parsed.keyPoints;
    } catch {
      summaryText = response;
      keyPoints = [];
    }
    const aiSummary = await AiSummary.create({
      documentId,
      summary: summaryText,
      keyPoints,
      modelUsed: MODEL,
    });
    await cacheSet(`summary:${documentId}`, aiSummary, 3600);
  } catch (err) {
    console.error(
      `[Reindex] Summary generation failed for ${documentId}:`,
      err,
    );
  }

  return { ok: true, chunks: chunks.length };
});
