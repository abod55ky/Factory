"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useImports } from "@/hooks/useImports";
import { Upload, Users, Clock, Package, CheckCircle2, Download, Eye, Save, XCircle, Loader2 } from "lucide-react";

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

type ReadXlsxSheetResult = {
  sheet?: string;
  data?: unknown[][];
};

const PREVIEW_ROWS_LIMIT = 100;

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

const parseCsvText = (content: string): string[][] => {
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

    if (char === "," && !inQuotes) {
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

const parseFileForPreview = async (file: File): Promise<ParsedPreviewFile> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  let matrix: unknown[][] = [];

  if (extension === "csv") {
    matrix = parseCsvText(await file.text());
  } else if (extension === "xlsx") {
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    const result = (await readXlsxFile(file)) as unknown;

    if (Array.isArray(result)) {
      matrix = result as unknown[][];
    } else {
      const sheetResult = result as ReadXlsxSheetResult;
      matrix = Array.isArray(sheetResult.data) ? sheetResult.data : [];
    }
  } else if (extension === "xls") {
    throw new Error("صيغة .xls غير مدعومة حالياً، يرجى التحويل إلى .xlsx أو .csv");
  } else {
    throw new Error("صيغة الملف غير مدعومة. استخدم .xlsx أو .csv");
  }

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

// 1. البيانات الثابتة للبطاقات (بدون أي دوال أو imports هنا!)
const importSections = [
  {
    title: "بيانات الموظفين",
    description: "ملف Excel يحتوي الاسم، المنصب، الأجر، أوقات الدوام",
    icon: Users,
    iconColor: "text-slate-700",
    bgColor: "bg-slate-100",
    entity: "employees", // أضفنا هذا لنعرف أي نوع نرفع
    enabled: true,
    templateEntity: "employees",
  },
  {
    title: "سجلات الحضور",
    description: "ملف CSV/Excel بتوقيتات الدخول والخروج من جهاز البصمة",
    icon: Clock,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    entity: "attendance",
    enabled: false,
    templateEntity: null,
  },
  {
    title: "جرد المخزون",
    description: "ملف Excel بأسماء المنتجات والكميات والأسعار",
    icon: Package,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    entity: "inventory",
    enabled: true,
    templateEntity: "products",
  },
];

const instructions = [
  "تأكد أن الملف بصيغة .xlsx أو .csv",
  "يجب أن يحتوي السطر الأول على عناوين الأعمدة",
  "سيتم عرض البيانات للمراجعة قبل الحفظ",
  "يمكنك تعديل أي سجل بعد الاستيراد",
];

export default function ImportPage() {
  const router = useRouter();
  const { validate, template, upload } = useImports();
  const [status, setStatus] = useState<string | null>(null);
  const [reviewPath, setReviewPath] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [cellEdits, setCellEdits] = useState<Record<string, string>>({});
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [dragEntity, setDragEntity] = useState<string | null>(null);
  const activeOperationRef = useRef(0);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  const visiblePreviewRows = useMemo(() => {
    if (!preview) return [];
    return preview.rows.slice(0, PREVIEW_ROWS_LIMIT);
  }, [preview]);

  const hiddenPreviewRows = preview ? Math.max(preview.rows.length - PREVIEW_ROWS_LIMIT, 0) : 0;
  const editedCellsCount = useMemo(() => Object.keys(cellEdits).length, [cellEdits]);

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
      const baseName = preview.fileName.replace(/\.(xlsx|csv)$/i, "");
      const payloadFile = new File([csvBody], `${baseName || preview.entity}-edited.csv`, {
        type: "text/csv;charset=utf-8;",
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
    <div className="p-8 bg-[#f9fafb] min-h-screen font-sans" dir="rtl">
      
      {/* الهيدر */}
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-slate-800">استيراد البيانات</h1>
        <p className="text-slate-500 text-sm mt-2">رفع ملفات Excel أو CSV لتحديث البيانات</p>
      </header>

      {/* منطقة عرض حالة الرفع إن وجدت */}
      {status && (
        <div className="mb-6 text-center p-4 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100">
          <p>{status}</p>
          {preview ? (
            <button
              type="button"
              onClick={openPreview}
              className="mt-3 ml-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              عرض المعاينة
            </button>
          ) : null}
          {reviewPath ? (
            <button
              type="button"
              onClick={() => router.push(reviewPath)}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              فتح صفحة البيانات بعد الاستيراد
            </button>
          ) : null}
        </div>
      )}

      {/* البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {importSections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            
            <div className={`w-12 h-12 ${section.bgColor} rounded-xl flex items-center justify-center mb-4`}>
              <section.icon size={24} className={section.iconColor} />
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1">{section.title}</h3>
            <p className="text-[11px] text-slate-400 mb-6 leading-relaxed px-4">
              {section.description}
            </p>

            {section.templateEntity ? (
              <button
                onClick={() => downloadTemplate(section.templateEntity)}
                className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download size={14} />
                تحميل قالب مطابق
              </button>
            ) : null}

            {/* منطقة السحب والإفلات */}
            <label
              onDragOver={(event) => handleDragOver(event, section.entity)}
              onDragLeave={(event) => handleDragLeave(event, section.entity)}
              onDrop={(event) => handleDrop(event, section.entity)}
              className={`w-full border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
                dragEntity === section.entity
                  ? "border-blue-500 bg-blue-100"
                  : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden" // نخفي الزر القبيح الافتراضي
                disabled={!section.enabled || isPreparingPreview || isSubmittingImport}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f, section.entity);
                  e.currentTarget.value = "";
                }}
              />
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500">
                  {section.enabled
                    ? dragEntity === section.entity
                      ? "أفلت الملف هنا الآن"
                      : "اسحب الملف هنا أو انقر للرفع"
                    : "غير مدعوم حالياً"}
                </p>
                <p className="text-[10px] text-slate-400">.xlsx, .csv</p>
              </div>
            </label>

          </div>
        ))}
      </div>

      {preview ? (
        <div ref={previewSectionRef} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 inline-flex items-center gap-2">
                <Eye size={18} className="text-blue-600" />
                معاينة الملف قبل الاستيراد
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                الملف: {preview.fileName} | عدد الصفوف: {preview.rows.length} | التعديلات: {editedCellsCount}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmImport}
                disabled={isPreparingPreview || isSubmittingImport}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingImport ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                تأكيد الاستيراد
              </button>

              <button
                type="button"
                onClick={cancelPreview}
                disabled={isSubmittingImport}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle size={14} />
                إلغاء المعاينة
              </button>
            </div>
          </div>

          {isPreparingPreview ? (
            <div className="text-xs text-slate-500 mb-4 inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              جاري فحص الملف والتحقق من البيانات...
            </div>
          ) : null}

          <div className="overflow-auto border border-slate-200 rounded-xl">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 border-b border-slate-200 text-slate-600 text-right sticky right-0 bg-slate-50">#</th>
                  {preview.headers.map((header) => (
                    <th key={header} className="p-2 border-b border-slate-200 text-slate-600 text-right whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePreviewRows.map((row) => (
                  <tr key={row.rowNumber} className="odd:bg-white even:bg-slate-50/50">
                    <td className="p-2 border-b border-slate-100 text-slate-500 sticky right-0 bg-inherit">{row.rowNumber}</td>
                    {preview.headers.map((header) => (
                      <td key={`${row.rowNumber}-${header}`} className="p-1 border-b border-slate-100 min-w-35">
                        <input
                          value={getEditedCellValue(row, header)}
                          onChange={(e) => onEditCell(row.rowNumber, header, e.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hiddenPreviewRows > 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              يتم عرض أول {PREVIEW_ROWS_LIMIT} صف فقط لتسريع الشاشة. سيتم إرسال جميع الصفوف عند التأكيد.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* قسم التعليمات */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6 text-right">تعليمات الاستيراد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instructions.map((text, index) => (
            <div key={index} className="flex items-center gap-3 justify-start">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="text-sm text-slate-600 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}