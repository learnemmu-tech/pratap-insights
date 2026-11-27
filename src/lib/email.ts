import { getDb } from "@/db";
import { emailOutbox } from "@/db/schema";
import { Resend } from "resend";

export async function deliverEmail(input: { to: string; subject: string; text: string }) {
  const db = getDb();
  const id = crypto.randomUUID();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (db) {
      await db.insert(emailOutbox).values({
        id,
        toAddress: input.to,
        subject: input.subject,
        body: input.text,
        status: "queued",
        error: "Email provider is not configured.",
      });
    }
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email outbox] To: ${input.to}\nSubject: ${input.subject}\n${input.text}`);
    }
    return { delivered: false, queued: true };
  }
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    if (db) {
      await db.insert(emailOutbox).values({
        id,
        toAddress: input.to,
        subject: input.subject,
        body: input.text,
        status: result.error ? "failed" : "sent",
        providerId: result.data?.id,
        error: result.error?.message,
      });
    }
    return { delivered: !result.error, queued: false, error: result.error?.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed.";
    if (db) {
      await db.insert(emailOutbox).values({
        id,
        toAddress: input.to,
        subject: input.subject,
        body: input.text,
        status: "failed",
        error: message,
      });
    }
    return { delivered: false, queued: false, error: message };
  }
}
