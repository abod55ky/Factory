"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useImports } from "@/hooks/useImports";
import { useFiles } from "@/hooks/useFiles";
import { Upload, Users, Clock, Package, CheckCircle2, Download, Eye, Save, XCircle, Loader2, FileText, Sparkles } from "lucide-react";

type ImportErrorShape = {
  message?: string;
};

type ImportValidationError = {
  row?: number;
  error?: string;
};

type ImportValidationResult = {
  totalRows?: number;
  errorRows?: number;
  errors?: ImportValidationError[];
  successRows?: number;
};

type PreviewRow = {
  rowNumber: number;
  values: Record<string, string>;
};

type PreviewState = {
  entity: string;
  fileName: string;
  headers: string[];
  rows: PreviewRow[];
};

type ParsedPreviewFile = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

type GeneralListedFile = {
  id?: string;
  originalName?: string;
  storedName?: string;
  path?: string;
  mimeType?: string | null;
  size?: number;
  extension?: string;
  uploadedAt?: string;
};

const PREVIEW_ROWS_LIMIT = 100;
const SUPPORTED_IMPORT_ACCEPT = ".xlsx,.csv,.tsv,.txt,.json";
const SUPPORTED_IMPORT_EXTENSIONS = new Set([
  "xlsx",
  "csv",
  "tsv",
  "txt",
  "json",
]);
const SUPPORTED_GENERAL_ACCEPT = ".pdf,.doc,.docx,.odt,.rtf,.txt,.md,.png,.jpg,.jpeg,.webp";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const candidate = (error as ImportErrorShape).message;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return fallback;
};

const toCellText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const makeUniqueHeaders = (rawHeaders: string[]) => {
  const counts = new Map<string, number>();

  return rawHeaders.map((header, index) => {
    const base = header.trim() || `column_${index + 1}`;
    const normalized = base.toLowerCase();
    const count = counts.get(normalized) || 0;
    counts.set(normalized, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
};

const parseDelimitedText = (content: string, delimiter: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
};

const matrixToPreview = (matrix: unknown[][]): ParsedPreviewFile => {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error("الملف فارغ ولا يحتوي بيانات للمعاينة");
  }

  const firstRow = Array.isArray(matrix[0]) ? matrix[0] : [];
  const headers = makeUniqueHeaders(firstRow.map((cell) => toCellText(cell)));

  const rows = matrix
    .slice(1)
    .map((cells) => {
      const rowObject: Record<string, string> = {};
      headers.forEach((header, columnIndex) => {
        rowObject[header] = toCellText(Array.isArray(cells) ? cells[columnIndex] : "");
      });
      return rowObject;
    })
    .filter((row) => headers.some((header) => (row[header] || "").trim() !== ""));

  return { headers, rows };
};

const parseJsonPreview = (content: string): ParsedPreviewFile => {
  let payload: unknown;

  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error("ملف JSON غير صالح. تأكد من صيغة الملف");
  }

  const rawRows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "rows" in payload && Array.isArray((payload as { rows?: unknown[] }).rows)
      ? (payload as { rows: unknown[] }).rows
      : null;

  if (!rawRows) {
    throw new Error("ملف JSON يجب أن يحتوي مصفوفة بيانات أو خاصية rows");
  }

  if (rawRows.length === 0) {
    throw new Error("ملف JSON فارغ ولا يحتوي بيانات للمعاينة");
  }

  if (rawRows.every((row) => Array.isArray(row))) {
    return matrixToPreview(rawRows as unknown[][]);
  }

  const objectRows = rawRows.filter((row) => row && typeof row === "object" && !Array.isArray(row)) as Array<Record<string, unknown>>;

  if (objectRows.length === 0) {
    throw new Error("بنية JSON غير مدعومة. استخدم مصفوفة كائنات أو مصفوفة صفوف");
  }

  const headerSet = new Set<string>();
  objectRows.forEach((row) => {
    Object.keys(row).forEach((key) => headerSet.add(key));
  });

  const headers = makeUniqueHeaders(Array.from(headerSet));
  const rows = objectRows.map((row) => {
    const normalized: Record<string, string> = {};
    headers.forEach((header) => {
      normalized[header] = toCellText(row[header]);
    });
    return normalized;
  });

  return { headers, rows };
};

const parseFileForPreview = async (file: File): Promise<ParsedPreviewFile> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (!SUPPORTED_IMPORT_EXTENSIONS.has(extension)) {
    throw new Error("صيغة الملف غير مدعومة للاستيراد. استخدم ملفات الجداول أو JSON فقط");
  }

  if (extension === "json") {
    return parseJsonPreview(await file.text());
  }

  let matrix: unknown[][] = [];

  if (extension === "csv") {
    matrix = parseDelimitedText(await file.text(), ",");
  } else if (extension === "tsv") {
    matrix = parseDelimitedText(await file.text(), "\t");
  } else if (extension === "txt") {
    const text = await file.text();
    matrix = parseDelimitedText(text, text.includes("\t") ? "\t" : ",");
  } else if (extension === "xlsx") {
    try {
      const { default: readXlsxFile } = await import("read-excel-file/browser");
      const workbookSheets = await readXlsxFile(file);
      const firstSheet = Array.isArray(workbookSheets) ? workbookSheets[0] : undefined;

      if (!firstSheet?.data || !Array.isArray(firstSheet.data)) {
        throw new Error("الملف لا يحتوي أي Sheet يمكن قراءتها");
      }

      matrix = firstSheet.data as unknown[][];
    } catch {
      throw new Error("تعذر قراءة ملف XLSX. يرجى حفظ الملف كـ XLSX/CSV وإعادة المحاولة");
    }
  } else {
    throw new Error("صيغة الملف غير مدعومة للمعاينة. استخدم .xlsx أو .csv أو .tsv أو .txt أو .json");
  }

  return matrixToPreview(matrix);
};

const escapeCsvCell = (value: string) => {
  const normalized = value.replace(/\r\n/g, "\n");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
};

const rowsToCsv = (headers: string[], rows: Array<Record<string, string>>) => {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => headers.map((header) => escapeCsvCell(row[header] || "")).join(","));
  return [headerLine, ...dataLines].join("\n");
};

const makeEditKey = (rowNumber: number, header: string) => `${rowNumber}::${header}`;

const formatBytes = (value?: number) => {
  if (!Number.isFinite(value) || (value as number) < 0) return "-";
  const bytes = value as number;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ar-EG");
};

// 1. البيانات الثابتة للبطاقات بتصميم يتوافق مع الألوان الجديدة
const importSections = [
  {
    title: "بيانات الموظفين",
    description: "ملف Excel يحتوي الاسم، المنصب، الأجر، أوقات الدوام",
    icon: Users,
    iconColor: "text-[#00bba7]",
    bgColor: "bg-[#00bba7]/10 border border-[#00bba7]/20",
    entity: "employees",
    enabled: true,
    templateEntity: "employees",
  },
  {
    title: "سجلات الحضور",
    description: "ملف CSV/Excel بتوقيتات الدخول والخروج من جهاز البصمة",
    icon: Clock,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50 border border-rose-100",
    entity: "attendance",
    enabled: true,
    templateEntity: null,
  },
  {
    title: "جرد المخزون",
    description: "ملف Excel بأسماء المنتجات والكميات والأسعار",
    icon: Package,
    iconColor: "text-[#E7C873]",
    bgColor: "bg-[#E7C873]/20 border border-[#E7C873]/30",
    entity: "inventory",
    enabled: true,
    templateEntity: "products",
  },
];

const instructions = [
  "الملفات المدعومة: .xlsx, .csv, .tsv, .txt, .json",
  "ملفات Word/PDF غير مناسبة لاستيراد جداول الموظفين أو المخزون",
  "لرفع الملفات العامة (PDF/Word/صور) استخدم بطاقة (رفع ملفات عامة) بالأسفل",
  "يجب أن يحتوي السطر الأول على عناوين الأعمدة",
  "سيتم عرض البيانات للمراجعة قبل الحفظ",
  "يمكنك تعديل أي سجل بعد الاستيراد",
];

export default function ImportPage() {
  const router = useRouter();
  const { validate, template, upload } = useImports();
  const { upload: uploadGeneralFile, list: generalFilesList } = useFiles();
  const [status, setStatus] = useState<string | null>(null);
  const [generalFilePath, setGeneralFilePath] = useState<string | null>(null);
  const [reviewPath, setReviewPath] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [cellEdits, setCellEdits] = useState<Record<string, string>>({});
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [isUploadingGeneralFile, setIsUploadingGeneralFile] = useState(false);
  const [dragEntity, setDragEntity] = useState<string | null>(null);
  const activeOperationRef = useRef(0);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  const visiblePreviewRows = useMemo(() => {
    if (!preview) return [];
    return preview.rows.slice(0, PREVIEW_ROWS_LIMIT);
  }, [preview]);

  const hiddenPreviewRows = preview ? Math.max(preview.rows.length - PREVIEW_ROWS_LIMIT, 0) : 0;
  const editedCellsCount = useMemo(() => Object.keys(cellEdits).length, [cellEdits]);
  const recentGeneralFiles = useMemo(() => {
    const files = (generalFilesList.data?.files || []) as GeneralListedFile[];
    return files.slice(0, 8);
  }, [generalFilesList.data?.files]);

  const startOperation = () => {
    activeOperationRef.current += 1;
    return activeOperationRef.current;
  };

  const isCurrentOperation = (operationId: number) => activeOperationRef.current === operationId;

  const clearPreview = () => {
    setPreview(null);
    setCellEdits({});
  };

  const openPreview = () => {
    previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resolveEditPath = (entity: string) => {
    if (entity === "employees") return "/employees";
    if (entity === "inventory" || entity === "products") return "/inventory";
    return null;
  };

  const getEditedCellValue = (row: PreviewRow, header: string) => {
    const key = makeEditKey(row.rowNumber, header);
    if (Object.prototype.hasOwnProperty.call(cellEdits, key)) {
      return cellEdits[key];
    }
    return row.values[header] || "";
  };

  const buildRowsForUpload = () => {
    if (!preview) return [];

    return preview.rows.map((row) => {
      const next: Record<string, string> = {};
      preview.headers.forEach((header) => {
        next[header] = getEditedCellValue(row, header);
      });
      return next;
    });
  };

  const cancelPreview = () => {
    startOperation();
    clearPreview();
    setDragEntity(null);
    setReviewPath(null);
    setIsPreparingPreview(false);
    setIsSubmittingImport(false);
    setStatus("تم إلغاء المعاينة الحالية");
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>, entity: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragEntity !== entity) {
      setDragEntity(entity);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>, entity: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragEntity === entity) {
      setDragEntity(null);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>, entity: string) => {
    event.preventDefault();
    event.stopPropagation();
    setDragEntity(null);

    const section = importSections.find((item) => item.entity === entity);
    if (!section?.enabled || isPreparingPreview || isSubmittingImport) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    await onFile(file, entity);
  };

  const downloadTemplate = async (entity: string) => {
    setStatus("جاري تحميل القالب...");
    try {
      const result = await template.mutateAsync(entity);

      const mimeType = result?.type || "text/csv;charset=utf-8;";
      const blob = result instanceof Blob ? result : new Blob([result], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = entity === "employees" ? "employees-template.csv" : "products-template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setStatus("تم تحميل القالب بنجاح");
    } catch (error) {
      setStatus(getErrorMessage(error, "فشل تحميل القالب"));
    }
  };

  const onGeneralFile = async (file: File) => {
    setGeneralFilePath(null);
    setStatus("جاري رفع الملف العام بشكل آمن...");
    setIsUploadingGeneralFile(true);

    try {
      const response = await uploadGeneralFile.mutateAsync({ file });
      const uploadedPath = response?.file?.path || null;
      setGeneralFilePath(uploadedPath);

      setStatus(
        `تم رفع الملف العام بنجاح: ${response?.file?.originalName || file.name}${uploadedPath ? ` (المسار: ${uploadedPath})` : ""}`,
      );
    } catch (error) {
      setStatus(getErrorMessage(error, "فشل رفع الملف العام"));
    } finally {
      setIsUploadingGeneralFile(false);
    }
  };

  const onFile = async (file: File, entity: string) => {
    const operationId = startOperation();
    setReviewPath(null);
    clearPreview();
    setStatus(`جاري قراءة ملف ${entity}...`);
    setIsPreparingPreview(true);

    try {
      const parsed = await parseFileForPreview(file);
      if (!isCurrentOperation(operationId)) return;

      if (parsed.rows.length === 0) {
        throw new Error("الملف لا يحتوي أي صف بيانات بعد العناوين");
      }

      setPreview({
        entity,
        fileName: file.name,
        headers: parsed.headers,
        rows: parsed.rows.map((values, index) => ({
          rowNumber: index + 1,
          values,
        })),
      });

      setStatus("تمت قراءة الملف. اضغط زر (عرض المعاينة) أو انزل للأسفل لتعديل البيانات ثم اضغط تأكيد الاستيراد.");
    } catch (error) {
      if (isCurrentOperation(operationId)) {
        clearPreview();
        setStatus(getErrorMessage(error, "فشل تجهيز معاينة الملف"));
      }
    } finally {
      if (isCurrentOperation(operationId)) {
        setIsPreparingPreview(false);
      }
    }
  };

  const onEditCell = (rowNumber: number, header: string, value: string) => {
    setCellEdits((previous) => ({
      ...previous,
      [makeEditKey(rowNumber, header)]: value,
    }));
  };

  const confirmImport = async () => {
    if (!preview) return;

    const operationId = startOperation();
    setReviewPath(null);
    setIsSubmittingImport(true);

    try {
      const editedRows = buildRowsForUpload();
      if (editedRows.length === 0) {
        throw new Error("لا توجد صفوف صالحة لإرسالها");
      }

      const csvBody = rowsToCsv(preview.headers, editedRows);
      const baseName = preview.fileName.replace(/\.(xlsx|csv|tsv|txt|json)$/i, "");
      const payloadFile = new File([csvBody], `${baseName || preview.entity}-edited.csv`, {
        type: "text/csv",
      });

      setStatus("جاري التحقق النهائي من النسخة المعدلة...");
      const validationResult = (await validate.mutateAsync({ entity: preview.entity, file: payloadFile })) as ImportValidationResult;
      if (!isCurrentOperation(operationId)) return;

      const errorRows = Number(validationResult.errorRows || 0);
      if (errorRows > 0) {
        const errors = Array.isArray(validationResult.errors) ? validationResult.errors : [];
        const first = errors[0];
        setStatus(
          `لا يمكن إكمال الاستيراد: يوجد ${errorRows} صف غير صالح${first?.row ? ` (السطر ${first.row}: ${first.error})` : ""}.`,
        );
        return;
      }

      setStatus("تم التحقق النهائي بنجاح، جاري رفع البيانات للحفظ...");
      const uploadResult = await upload.mutateAsync({ entity: preview.entity, file: payloadFile });
      if (!isCurrentOperation(operationId)) return;

      const uploadedRows = Number(uploadResult?.successRows || 0);
      const uploadedErrors = Number(uploadResult?.errorRows || 0);
      const totalRows = Number(uploadResult?.totalRows || 0);

      if (uploadedErrors > 0) {
        setReviewPath(resolveEditPath(preview.entity));
        setStatus(
          `تمت عملية الاستيراد مع ملاحظات: ${uploadedRows} ناجح من أصل ${totalRows}، وعدد ${uploadedErrors} صف غير صالح`,
        );
        return;
      }

      setReviewPath(resolveEditPath(preview.entity));
      setStatus(
        `تم رفع الملف واستيراد البيانات بنجاح (${uploadedRows || totalRows} سجل). رقم العملية: ${uploadResult?.jobId || "N/A"}`,
      );
    } catch (error) {
      if (isCurrentOperation(operationId)) {
        setStatus(getErrorMessage(error, "فشل استيراد الملف"));
      }
    } finally {
      if (isCurrentOperation(operationId)) {
        setIsSubmittingImport(false);
      }
    }
  };

  return (
    /* الخلفية المتدرجة الأساسية للموقع */
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#00bba7] via-[#00bba7]/90 to-[#E7C873]" dir="rtl">
      
      {/* الحاوية الرئيسية (Wrapper) الزجاجية مع البوردر الذهبي والشادو */}
      <div className="relative z-10 w-full max-w-7xl min-h-[90vh] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          {/* الهيدر */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-8 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  <Upload size={24} className="text-white animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">استيراد البيانات</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium pr-14 mt-1">رفع ملفات جداول متعددة (Excel/CSV/TSV/TXT/JSON) لتحديث البيانات بضغطة زر.</p>
            </div>
          </header>

          {/* منطقة عرض حالة الرفع إن وجدت */}
          {status && (
            <div className="mb-8 text-center p-5 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-top-4 duration-300">
              <p className="text-sm font-bold text-[#00bba7] flex items-center justify-center gap-2">
                <Sparkles size={16} className="animate-pulse" /> {status}
              </p>
              {generalFilePath ? <p className="mt-2 text-[11px] font-mono text-slate-500">المسار المخزن: {generalFilePath}</p> : null}
              
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {preview ? (
                  <button
                    type="button"
                    onClick={openPreview}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] px-5 py-2.5 text-xs font-bold text-white hover:from-[#00a392] hover:to-[#006e63] shadow-md active:scale-95 transition-all"
                  >
                    <Eye size={16} /> عرض المعاينة
                  </button>
                ) : null}
                {reviewPath ? (
                  <button
                    type="button"
                    onClick={() => router.push(reviewPath)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#00bba7]/30 text-[#00bba7] px-5 py-2.5 text-xs font-bold hover:bg-[#00bba7]/10 shadow-sm active:scale-95 transition-all"
                  >
                    فتح صفحة البيانات بعد الاستيراد
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* البطاقات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {importSections.map((section, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all p-6 md:p-8 flex flex-col items-center text-center group">
                
                <div className={`w-14 h-14 ${section.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:animate-pulse transition-all`}>
                  <section.icon size={26} className={section.iconColor} />
                </div>
                
                <h3 className="font-extrabold text-slate-800 mb-2">{section.title}</h3>
                <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed px-2">
                  {section.description}
                </p>

                {section.templateEntity ? (
                  <button
                    onClick={() => downloadTemplate(section.templateEntity)}
                    className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#00bba7] bg-[#00bba7]/10 border border-[#00bba7]/20 px-4 py-2 rounded-xl hover:bg-[#00bba7]/20 transition-colors shadow-sm w-full justify-center active:scale-95"
                  >
                    <Download size={14} className="group-hover:-translate-y-1 transition-transform" />
                    تحميل قالب مطابق
                  </button>
                ) : null}

                {/* منطقة السحب والإفلات */}
                <label
                  onDragOver={(event) => handleDragOver(event, section.entity)}
                  onDragLeave={(event) => handleDragLeave(event, section.entity)}
                  onDrop={(event) => handleDrop(event, section.entity)}
                  className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer group/drop flex-1 flex flex-col justify-center ${
                    dragEntity === section.entity
                      ? "border-[#00bba7] bg-[#00bba7]/5"
                      : "border-slate-200 bg-white/50 hover:border-[#00bba7]/50 hover:bg-[#00bba7]/[0.02]"
                  }`}
                >
                  <input
                    type="file"
                    accept={SUPPORTED_IMPORT_ACCEPT}
                    className="hidden"
                    disabled={!section.enabled || isPreparingPreview || isSubmittingImport}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f, section.entity);
                      e.currentTarget.value = "";
                    }}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className={`text-slate-400 transition-colors ${dragEntity === section.entity ? 'text-[#00bba7]' : 'group-hover/drop:text-[#00bba7]'}`} />
                    <p className="text-xs font-bold text-slate-500 mt-2">
                      {section.enabled
                        ? dragEntity === section.entity
                          ? "أفلت الملف هنا الآن"
                          : "اسحب الملف هنا أو انقر للرفع"
                        : "غير مدعوم حالياً"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">.xlsx, .csv, .json</p>
                  </div>
                </label>

              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] p-8 mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00bba7]/10 flex items-center justify-center border border-[#00bba7]/20">
                <FileText size={22} className="text-[#00bba7]" />
              </div>
              <div className="text-right">
                <h3 className="font-extrabold text-slate-800 text-lg">رفع ملفات عامة</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  لرفع ملفات PDF/Word/صور/نص بشكل آمن. هذا القسم لا يستورد بيانات جداول.
                </p>
              </div>
            </div>

            <label className="w-full block border-2 border-dashed border-slate-200 bg-white/50 hover:border-[#00bba7]/50 hover:bg-[#00bba7]/[0.02] rounded-3xl p-10 cursor-pointer transition-all group/drop">
              <input
                type="file"
                accept={SUPPORTED_GENERAL_ACCEPT}
                className="hidden"
                disabled={isPreparingPreview || isSubmittingImport || isUploadingGeneralFile}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onGeneralFile(file);
                  }
                  event.currentTarget.value = "";
                }}
              />

              <div className="flex flex-col items-center gap-3 text-center">
                {isUploadingGeneralFile ? (
                  <Loader2 size={32} className="text-[#00bba7] animate-spin" />
                ) : (
                  <Upload size={32} className="text-slate-400 group-hover/drop:text-[#00bba7] transition-colors group-hover/drop:-translate-y-2 duration-300" />
                )}

                <p className="text-sm font-bold text-slate-600 mt-2">
                  {isUploadingGeneralFile ? "جاري رفع الملف..." : "اسحب الملف هنا أو انقر للرفع"}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">.pdf, .doc, .docx, .png, .jpg ...</p>
              </div>
            </label>

            <div className="mt-8 border border-slate-100 rounded-2xl p-5 bg-slate-50/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-extrabold text-slate-700">آخر الملفات المرفوعة</h4>
                <button
                  type="button"
                  onClick={() => generalFilesList.refetch()}
                  className="text-xs font-bold text-[#00bba7] hover:text-[#008275] bg-white px-3 py-1.5 rounded-lg border border-[#00bba7]/20 shadow-sm active:scale-95 transition-all"
                >
                  تحديث القائمة
                </button>
              </div>

              {generalFilesList.isLoading ? (
                <div className="text-xs font-bold text-[#00bba7] inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  جاري تحميل قائمة الملفات...
                </div>
              ) : generalFilesList.isError ? (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl">فشل تحميل قائمة الملفات المرفوعة</p>
              ) : recentGeneralFiles.length === 0 ? (
                <p className="text-xs font-medium text-slate-400 text-center py-4">لا توجد ملفات مرفوعة حتى الآن</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentGeneralFiles.map((item, index) => (
                    <div
                      key={`${item.path || item.storedName || "file"}-${index}`}
                      className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#00bba7]/30 transition-all"
                    >
                      <p className="text-xs font-black text-slate-800 break-all mb-1">{item.originalName || item.storedName || "-"}</p>
                      <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded truncate">{item.path || "-"}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-[#00bba7] bg-[#00bba7]/10 px-2 py-1 rounded-md">{formatBytes(item.size)}</span>
                        <span className="text-[10px] font-bold text-[#E7C873] bg-[#E7C873]/10 px-2 py-1 rounded-md uppercase">{item.extension || "-"}</span>
                        <span className="text-[10px] font-medium text-slate-500 mr-auto">{formatDateTime(item.uploadedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {preview ? (
            <div ref={previewSectionRef} className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.05)] mb-10 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800 inline-flex items-center gap-3">
                    <div className="p-2 bg-[#00bba7]/10 rounded-lg"><Eye size={20} className="text-[#00bba7]" /></div>
                    معاينة الملف قبل الاستيراد
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-1 rounded font-mono">{preview.fileName}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{preview.rows.length} صف</span>
                    <span className="bg-[#E7C873]/20 text-[#b88710] px-2 py-1 rounded">{editedCellsCount} تعديل</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={cancelPreview}
                    disabled={isSubmittingImport}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shadow-sm active:scale-95 transition-all"
                  >
                    <XCircle size={16} />
                    إلغاء المعاينة
                  </button>

                  <button
                    type="button"
                    onClick={confirmImport}
                    disabled={isPreparingPreview || isSubmittingImport}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] px-5 py-2.5 text-xs font-bold text-white hover:from-[#00a392] hover:to-[#006e63] shadow-md disabled:opacity-60 active:scale-95 transition-all border border-[#00bba7]/50"
                  >
                    {isSubmittingImport ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    تأكيد الاستيراد
                  </button>
                </div>
              </div>

              {isPreparingPreview ? (
                <div className="text-sm font-bold text-[#00bba7] mb-6 p-4 bg-[#00bba7]/5 rounded-xl border border-[#00bba7]/10 inline-flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin" />
                  جاري فحص الملف والتحقق من البيانات...
                </div>
              ) : null}

              <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="min-w-full text-right border-collapse">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="p-4 border-b border-slate-100 text-[#00bba7] font-black text-xs sticky right-0 bg-slate-50/90 backdrop-blur-sm z-10 w-12 text-center shadow-[1px_0_5px_rgba(0,0,0,0.02)]">#</th>
                        {preview.headers.map((header) => (
                          <th key={header} className="p-4 border-b border-slate-100 text-slate-600 font-extrabold text-xs whitespace-nowrap bg-slate-50/50">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {visiblePreviewRows.map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                          <td className="p-3 border-b border-slate-50 text-slate-400 font-mono text-xs sticky right-0 bg-white group-hover:bg-slate-50/50 transition-colors text-center shadow-[1px_0_5px_rgba(0,0,0,0.02)]">{row.rowNumber}</td>
                          {preview.headers.map((header) => (
                            <td key={`${row.rowNumber}-${header}`} className="p-2 border-b border-slate-50 min-w-40">
                              <input
                                value={getEditedCellValue(row, header)}
                                onChange={(e) => onEditCell(row.rowNumber, header, e.target.value)}
                                className="w-full rounded-lg border border-transparent bg-slate-50/50 hover:bg-slate-100/80 px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] transition-all"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {hiddenPreviewRows > 0 ? (
                <p className="mt-5 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  يتم عرض أول <span className="text-[#00bba7]">{PREVIEW_ROWS_LIMIT}</span> صف فقط لتسريع الشاشة. سيتم إرسال جميع الصفوف عند التأكيد.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* قسم التعليمات */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-[#E7C873]" /> تعليمات الاستيراد
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {instructions.map((text, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-[#00bba7]/30 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#00bba7]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-black text-[#00bba7]">{index + 1}</span>
                  </div>
                  <span className="text-sm text-slate-700 font-bold leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}