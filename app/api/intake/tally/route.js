import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

const SOURCE = "tally-behind-your-website-files";

function makeAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function safeEqual(a, b) {
  try {
    const aBuffer = Buffer.from(String(a || ""));
    const bBuffer = Buffer.from(String(b || ""));

    if (aBuffer.length !== bBuffer.length) return false;

    return crypto.timingSafeEqual(aBuffer, bBuffer);
  } catch {
    return false;
  }
}

function verifyTallySignature(payload, receivedSignature) {
  const secret = process.env.TALLY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing TALLY_WEBHOOK_SECRET.");
  }

  if (!receivedSignature) {
    return false;
  }

  const calculatedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("base64");

  return safeEqual(receivedSignature, calculatedSignature);
}

function normalizeLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function fieldValue(fields, possibleLabels) {
  const wanted = possibleLabels.map(normalizeLabel);

  const field = fields.find((item) =>
    wanted.includes(normalizeLabel(item?.label))
  );

  return field?.value ?? null;
}

export async function POST(request) {
  try {
    const payload = await request.json();

    const receivedSignature =
      request.headers.get("tally-signature");

    if (!verifyTallySignature(payload, receivedSignature)) {
      return Response.json(
        {
          ok: false,
          error: "Invalid Tally signature.",
        },
        {
          status: 401,
        }
      );
    }

    if (payload?.eventType !== "FORM_RESPONSE") {
      return Response.json({
        ok: true,
        ignored: true,
      });
    }

    const data = payload?.data || {};
    const fields =
      Array.isArray(data.fields)
        ? data.fields
        : [];

    const submissionId =
      data.submissionId ||
      data.responseId ||
      payload.eventId ||
      null;

    const formId =
      data.formId || null;

    const projectToken =
      fieldValue(fields, [
        "project",
        "project_token",
        "project token",
      ]);

    const businessName =
      fieldValue(fields, [
        "business name",
        "business",
        "company name",
      ]);

    const contactName =
      fieldValue(fields, [
        "your name",
        "name",
        "full name",
      ]);

    const email =
      fieldValue(fields, [
        "email",
        "email address",
      ]);

    const supabase =
      makeAdminClient();

    /*
      Prevent duplicate webhook retries
    */

    if (submissionId) {
      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from("form_submissions")
        .select("id,status,project_id")
        .eq("source", SOURCE)
        .eq(
          "external_submission_id",
          submissionId
        )
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existing) {
        return Response.json({
          ok: true,
          duplicate: true,
          submission_id:
            existing.id,
          status:
            existing.status,
          project_id:
            existing.project_id,
        });
      }
    }

    /*
      Match the Tally hidden project token
      to projects.intake_token
    */

    let project = null;

    if (projectToken) {
      const {
        data: matchedProject,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(
          "id,business_id,project_name"
        )
        .eq(
          "intake_token",
          projectToken
        )
        .maybeSingle();

      if (projectError) {
        throw projectError;
      }

      project =
        matchedProject;
    }

    const submissionStatus =
      project
        ? "processed"
        : "needs_review";

    /*
      Store the complete Tally payload.

      This includes the uploaded-file
      metadata and URLs supplied by Tally.
    */

    const {
      data: intake,
      error: intakeError,
    } = await supabase
      .from("form_submissions")
      .insert({
        source: SOURCE,

        external_form_id:
          formId,

        external_submission_id:
          submissionId,

        contact_name:
          contactName,

        business_name:
          businessName,

        email,

        payload,

        status:
          submissionStatus,

        business_id:
          project?.business_id || null,

        project_id:
          project?.id || null,

        received_at:
          data.createdAt ||
          payload.createdAt ||
          new Date().toISOString(),

        processed_at:
          project
            ? new Date().toISOString()
            : null,

        error_message:
          project
            ? null
            : projectToken
              ? "Project token did not match a Studio project."
              : "No project token was supplied.",
      })
      .select(
        "id,status,project_id"
      )
      .single();

    if (intakeError) {
      throw intakeError;
    }

    return Response.json({
      ok: true,

      intake_id:
        intake.id,

      status:
        intake.status,

      project_id:
        intake.project_id,

      matched_project:
        Boolean(project),
    });

  } catch (error) {

    console.error(
      "Tally intake error:",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          "Tally intake failed.",
      },
      {
        status: 500,
      }
    );
  }
}