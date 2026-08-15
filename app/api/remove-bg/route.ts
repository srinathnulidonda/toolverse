// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
const UPSTREAM_TIMEOUT_MS = 50000;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export async function POST(request: NextRequest) {
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