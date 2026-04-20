import { NextResponse } from "next/server";

type MetricBody = {
  name?: string;
  value?: number;
  id?: string;
  rating?: string;
  delta?: number;
  navigationType?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MetricBody;
    if (!body?.name || typeof body.value !== "number" || !body.id) {
      return NextResponse.json({ ok: false, error: "invalid_metric" }, { status: 400 });
    }

    // Replace with your logger/observability sink (Sentry/Datadog/etc).
    console.log("[web-vitals]", {
      name: body.name,
      value: body.value,
      id: body.id,
      rating: body.rating,
      delta: body.delta,
      navigationType: body.navigationType,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}

