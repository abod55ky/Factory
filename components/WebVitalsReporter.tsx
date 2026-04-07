"use client";

import { useReportWebVitals } from "next/web-vitals";

type WebVitalMetric = {
  name: string;
  value: number;
  id: string;
  rating?: string;
  delta?: number;
  navigationType?: string;
};

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: "rating" in metric ? String(metric.rating) : undefined,
      delta: "delta" in metric && typeof metric.delta === "number" ? metric.delta : undefined,
      navigationType:
        "navigationType" in metric ? String(metric.navigationType) : undefined,
    };

    void fetch("/api/telemetry/web-vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Keep UI flow unaffected if telemetry endpoint is unavailable.
    });
  });

  return null;
}
