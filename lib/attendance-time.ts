export const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const normalizeHHmm = (value?: string) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();

  if (HH_MM_REGEX.test(trimmed)) return trimmed;

  const match = trimmed.match(/(\d{2}):(\d{2})/);
  if (!match) return "";

  const hhmm = `${match[1]}:${match[2]}`;
  return HH_MM_REGEX.test(hhmm) ? hhmm : "";
};

