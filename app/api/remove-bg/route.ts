// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";

export const runtime = "nodejs";
export const maxDuration = 60;

// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(ip: string): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    // First request from this IP
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  // Reset if window has passed
  if (now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  // Increment count
  record.count += 1;

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: record.resetTime };
  }

  return { allowed: true, resetTime: record.resetTime };
}

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
const UPSTREAM_TIMEOUT_MS = 50000;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

// Allowed file types for background removal
const ALLOWED_FILE_TYPES = [
  { mime: "image/png", extension: "png" },
  { mime: "image/jpeg", extension: "jpg" },
  { mime: "image/jpeg", extension: "jpeg" },
  { mime: "image/webp", extension: "webp" },
];

export async function POST(request: NextRequest) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  let ip = "unknown";
  if (forwarded) {
    // x-forwarded-for can be a list of IPs
    ip = forwarded.split(",")[0].trim();
  } else {
    ip = request.headers.get("x-real-ip") || "unknown";
  }

  const { allowed, resetTime } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  if (!REMOVE_BG_API_KEY) {
    return NextResponse.json(
      { error: "Server is not configured for background removal." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the uploaded file." }, { status: 400 });
  }

  const image = formData.get("image");

  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }

  if (image.size === 0) {
    return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
  }

  if (image.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File size exceeds the 12 MB limit." }, { status: 413 });
  }

  // Server-side MIME-type verification using file-type
  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      return NextResponse.json(
        { error: "Unable to detect file type. Please upload a valid image file." },
        { status: 400 }
      );
    }

    const isAllowedType = ALLOWED_FILE_TYPES.some(
      allowed => allowed.mime === detectedType.mime
    );

    if (!isAllowedType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${detectedType.mime}. Allowed types: PNG, JPG, JPEG, WebP` },
        { status: 415 }
      );
    }
  } catch (error) {
    console.error("File type detection error:", error);
    return NextResponse.json(
      { error: "Error processing file. Please try again." },
      { status: 500 }
    );
  }

  const apiFormData = new FormData();
  apiFormData.append("image_file", image);
  apiFormData.append("size", "auto");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVE_BG_API_KEY,
      },
      body: apiFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "Background removal failed.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.errors?.[0]?.title || errorMessage;
      } catch {
        errorMessage = `Background removal failed (status ${response.status}).`;
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const resultArrayBuffer = await response.arrayBuffer();

    if (resultArrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Received an empty result from the provider." }, { status: 502 });
    }

    return new NextResponse(resultArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": resultArrayBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Background removal timed out. Please try again with a smaller image." },
        { status: 504 }
      );
    }

    console.error("Remove background API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}