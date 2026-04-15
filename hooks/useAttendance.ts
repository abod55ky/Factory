import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/lib/query-cache";

export type AttendanceSource = "manual" | "device";
export type AttendanceType = "IN" | "OUT";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  timestamp: string;
  date: string;
  type: AttendanceType;
  source?: string;
  verified?: boolean;
  deviceId?: string;
  location?: string;
  notes?: string;
}

export interface AttendanceDailyRecord {
  key: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  source: AttendanceSource;
  checkInRecordId?: string;
  checkOutRecordId?: string;
  verified: boolean;
}

interface AttendanceListResponse {
  records: AttendanceRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  dailyRecords: AttendanceDailyRecord[];
}

export interface AttendanceQueryParams {
  employeeId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceQueryOptions {
  enabled?: boolean;
}

export interface AttendancePayload {
  employeeId: string;
  timestamp: string;
  type: AttendanceType;
  source?: AttendanceSource;
  deviceId?: string;
  location?: string;
  notes?: string;
  verified?: boolean;
}

export interface MarkAttendanceInput {
  employeeId: string;
  date?: string; // YYYY-MM-DD (defaults to local today)
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  source?: AttendanceSource;
  deviceId?: string;
  location?: string;
  notes?: string;
}

const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ATTENDANCE_MAX_LIMIT = 200;
const ATTENDANCE_DEFAULT_LIMIT = 200;

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string | string[];
      error?: string;
    };
  };
  message?: string;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const typed = error as ApiErrorShape;
  const apiMessage = typed?.response?.data?.message;

  if (Array.isArray(apiMessage) && apiMessage.length > 0) {
    return apiMessage.join(" | ");
  }

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  const nestedError = typed?.response?.data?.error;
  if (typeof nestedError === "string" && nestedError.trim()) {
    return nestedError;
  }

  if (typeof typed?.message === "string" && typed.message.trim()) {
    return typed.message;
  }

  return fallback;
};

const sanitizePositiveInt = (value: number | undefined, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  const normalized = Math.trunc(Number(value));
  return normalized > 0 ? normalized : fallback;
};

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateKey = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return getLocalDateString(date);
};

const toHHmm = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const buildTimestampFromDateAndTime = (date: string, hhmm: string) => {
  if (!HH_MM_REGEX.test(hhmm)) {
    throw new Error("الوقت يجب أن يكون بصيغة HH:mm");
  }

  const [hours, minutes] = hhmm.split(":").map(Number);
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setHours(hours, minutes, 0, 0);
  return parsed.toISOString();
};

const normalizeSource = (source?: string): AttendanceSource => (source === "device" ? "device" : "manual");

const inDateRange = (date: string, startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return true;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

const toDailyRecords = (records: AttendanceRecord[], startDate?: string, endDate?: string): AttendanceDailyRecord[] => {
  const grouped = new Map<string, AttendanceRecord[]>();

  for (const record of records) {
    const date = record.date || toDateKey(record.timestamp);
    if (!date || !inDateRange(date, startDate, endDate)) continue;

    const key = `${record.employeeId}-${date}`;
    const current = grouped.get(key) || [];
    current.push({ ...record, date });
    grouped.set(key, current);
  }

  const rows: AttendanceDailyRecord[] = [];

  grouped.forEach((events, key) => {
    const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const inEvents = sorted.filter((x) => x.type === "IN");
    const outEvents = sorted.filter((x) => x.type === "OUT");

    const firstIn = inEvents[0];
    const lastOut = outEvents[outEvents.length - 1];
    const sample = sorted[0];

    const source = sorted.some((x) => normalizeSource(x.source) === "device") ? "device" : "manual";
    const verified = sorted.every((x) => x.verified !== false);

    rows.push({
      key,
      employeeId: sample.employeeId,
      date: sample.date || toDateKey(sample.timestamp),
      checkIn: firstIn ? toHHmm(firstIn.timestamp) : "",
      checkOut: lastOut ? toHHmm(lastOut.timestamp) : "",
      source,
      checkInRecordId: firstIn?.id,
      checkOutRecordId: lastOut?.id,
      verified,
    });
  });

  return rows.sort((a, b) => `${b.date}-${b.employeeId}`.localeCompare(`${a.date}-${a.employeeId}`));
};

export const useAttendance = (params?: AttendanceQueryParams, options?: AttendanceQueryOptions) => {
  const queryClient = useQueryClient();
  const fallbackToday = getLocalDateString();
  const requestedPage = sanitizePositiveInt(params?.page, 1);
  const requestedLimit = sanitizePositiveInt(params?.limit, ATTENDANCE_DEFAULT_LIMIT);
  const perRequestLimit = Math.min(requestedLimit, ATTENDANCE_MAX_LIMIT);
  const hasExplicitPage = Number.isFinite(params?.page) && Number(params?.page) > 0;

  const requestDate = params?.date ?? (!params?.startDate && !params?.endDate ? fallbackToday : undefined);
  const resolvedStartDate = params?.startDate ?? requestDate;
  const resolvedEndDate = params?.endDate ?? requestDate;

  const query = useQuery<AttendanceListResponse>({
    queryKey: [
      "attendance",
      params?.employeeId || "all-employees",
      requestDate || "all-dates",
      resolvedStartDate || "no-start",
      resolvedEndDate || "no-end",
      requestedPage,
      requestedLimit,
    ],
    queryFn: async () => {
      const startDateParam = requestDate ? undefined : resolvedStartDate;
      const endDateParam = requestDate ? undefined : resolvedEndDate;

      const fetchPage = async (page: number) => {
        return await apiClient.get("/attendance", {
          params: {
            employeeId: params?.employeeId,
            date: requestDate,
            startDate: startDateParam,
            endDate: endDateParam,
            page,
            limit: perRequestLimit,
          },
        });
      };

      try {
        if (requestedLimit <= ATTENDANCE_MAX_LIMIT || hasExplicitPage) {
          const res = await fetchPage(requestedPage);
          const records: AttendanceRecord[] = Array.isArray(res.data?.records) ? res.data.records : [];

          return {
            records,
            pagination: res.data?.pagination,
            dailyRecords: toDailyRecords(records, resolvedStartDate, resolvedEndDate),
          };
        }

        const aggregatedRecords: AttendanceRecord[] = [];
        let pageCursor = requestedPage;
        let lastPagination: AttendanceListResponse["pagination"] | undefined;

        while (true) {
          const res = await fetchPage(pageCursor);
          const pageRecords: AttendanceRecord[] = Array.isArray(res.data?.records) ? res.data.records : [];
          aggregatedRecords.push(...pageRecords);
          lastPagination = res.data?.pagination;

          const totalPages = Number(lastPagination?.pages || pageCursor);
          const isLastPage = pageCursor >= totalPages;
          const reachedRequestedSize = aggregatedRecords.length >= requestedLimit;

          if (isLastPage || reachedRequestedSize || pageRecords.length === 0) {
            break;
          }

          pageCursor += 1;
        }

        const records = aggregatedRecords.slice(0, requestedLimit);
        return {
          records,
          pagination: lastPagination,
          dailyRecords: toDailyRecords(records, resolvedStartDate, resolvedEndDate),
        };
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "فشل تحميل الحضور"));
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: QUERY_STALE_TIME.FAST,
    gcTime: QUERY_GC_TIME.RELAXED,
  });

  const createAttendance = useMutation({
    mutationFn: async (payload: AttendancePayload) => {
      const cleanPayload = {
        ...payload,
        source: payload.source || "manual",
      };
      return await apiClient.post("/attendance", cleanPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: Partial<AttendancePayload> }) => {
      const cleanPayload = {
        ...data,
        source: data.source || "manual",
      };
      return await apiClient.put(`/attendance/${recordId}`, cleanPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"], exact: false });
    },
  });

  const markAttendance = useMutation({
    mutationFn: async (input: MarkAttendanceInput) => {
      if (!input.checkIn && !input.checkOut) {
        throw new Error("يجب إدخال checkIn أو checkOut على الأقل");
      }

      const attendanceDate = input.date || getLocalDateString();
      const source = input.source || "manual";

      console.log("[Attendance] markAttendance request", {
        employeeId: input.employeeId,
        date: attendanceDate,
      });

      const existingRes = await apiClient.get(`/attendance/employee/${input.employeeId}/date/${attendanceDate}`);
      const existingRecords: AttendanceRecord[] = Array.isArray(existingRes.data?.records) ? existingRes.data.records : [];

      const inRecords = [...existingRecords]
        .filter((x) => x.type === "IN")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const outRecords = [...existingRecords]
        .filter((x) => x.type === "OUT")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      let lastResponse: unknown = null;

      if (input.checkIn) {
        const checkInTimestamp = buildTimestampFromDateAndTime(attendanceDate, input.checkIn);
        const payload: AttendancePayload = {
          employeeId: input.employeeId,
          timestamp: checkInTimestamp,
          type: "IN",
          source,
          deviceId: input.deviceId,
          location: input.location,
          notes: input.notes,
        };

        if (inRecords[0]?.id) {
          lastResponse = await apiClient.put(`/attendance/${inRecords[0].id}`, payload);
        } else {
          lastResponse = await apiClient.post("/attendance", payload);
        }
      }

      if (input.checkOut) {
        const checkOutTimestamp = buildTimestampFromDateAndTime(attendanceDate, input.checkOut);
        const payload: AttendancePayload = {
          employeeId: input.employeeId,
          timestamp: checkOutTimestamp,
          type: "OUT",
          source,
          deviceId: input.deviceId,
          location: input.location,
          notes: input.notes,
        };

        // Biometric-ready upsert: if same employee+date exists, update existing OUT record instead of inserting duplicates.
        if (outRecords[outRecords.length - 1]?.id) {
          const outRecordId = outRecords[outRecords.length - 1].id;
          lastResponse = await apiClient.put(`/attendance/${outRecordId}`, payload);
        } else {
          // No OUT event exists yet for that date: create first OUT event.
          lastResponse = await apiClient.post("/attendance", payload);
        }
      }

      return lastResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"], exact: false });
      toast.success("تم تسجيل الحضور بنجاح");
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "فشل تسجيل الحضور");
      toast.error(message);
    },
  });

  return {
    ...query,
    createAttendance,
    updateAttendance,
    markAttendance,
  };
};
