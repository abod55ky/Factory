# الدليل الشامل للفرونت إند (Next.js) — مشروع Factory

> هذا الملف مرجع تعليمي عملي مبني على مشروعك الحالي فعلاً، وليس شرح عام.
> الهدف: تتعلم Next.js بعمق انطلاقاً من خبرتك بـ React، وتعرف ما الذي تستخدمه الآن وما الذي يجب أن تعتمده لاحقاً.

---

## 1) الملخص التنفيذي

### ما تستخدمه الآن فعلياً في المشروع
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- React Query v5 لإدارة بيانات السيرفر
- Zustand لإدارة حالة المصادقة
- Axios عميل API مع interceptors
- Route protection عبر `proxy.ts` (بديل middleware في Next 16)
- بنية صفحات Dashboard عبر Route Groups
- Vitest للاختبارات

### ما يجب أن تلتزم به لتطوير المستوى
- اعتماد فلسفة Server Components بشكل أكبر (وعدم تحويل كل شيء إلى Client Components)
- توحيد استراتيجية الجلب: متى Server Fetch ومتى React Query
- زيادة عزل طبقة API + توحيد معالجة الأخطاء
- رفع مستوى الأداء عبر تقسيم الحِمل (dynamic import) وتحليل الحزم
- رفع الاختبارات من مستوى hooks إلى مكونات ومسارات حرجة

---

## 2) خريطة مشروعك الحالي (Frontend)

### المجلدات المحورية
- `app/`:
  - `(auth)/login` تسجيل الدخول
  - `(dashboard)/...` صفحات النظام الأساسية (موظفين، حضور، رواتب، مخزون، استيراد)
  - `error.tsx`, `loading.tsx`, `not-found.tsx` مسارات معالجة حالات الواجهة
- `components/`:
  - Sidebar + مجموعة modals لإدارة العمليات (رواتب، سلف، مخزون...)
  - `Providers.tsx` لتهيئة React Query و Toaster
- `hooks/`:
  - `useEmployees`, `useAttendance`, `usePayroll`... تنظيم منطق البيانات حسب الدومين
- `lib/`:
  - `api-client.ts` عميل Axios وسياسات auth/redirect
  - `route-access.ts` مصفوفات الحماية حسب route/role
  - `query-cache.ts` مركزية إعدادات stale/gc
- `stores/`:
  - `auth-store.ts` Zustand + persist
- `proxy.ts`:
  - فحص الجلسة وتطبيق redirect/authorization قبل الدخول للمسارات المحمية

---

## 3) مفاهيم Next.js التي تحتاج إتقانها (مترجمة من React mindset)

## 3.1 App Router هو العمود الفقري
في React التقليدي غالباً تعتمد react-router داخل SPA، بينما هنا:
- كل ملف داخل `app` هو route أو layout أو boundary
- `layout.tsx` يورث الهيكل للأبناء
- `loading.tsx` fallback تلقائي
- `error.tsx` boundary تلقائي
- `not-found.tsx` 404 على مستوى route segment

هذا يعني أن التوجيه، هيكل الصفحة، وحالات التحميل أصبحت جزءاً من بنية الملفات نفسها.

## 3.2 Server Components vs Client Components
في React أنت معتاد أن كل شيء client-side.
في Next App Router:
- الافتراضي Server Component
- أي ملف فيه `"use client"` يصبح Client Component

قاعدة عملية مهمة:
- اجعل الصفحة Server قدر الإمكان
- انقل فقط الأجزاء التفاعلية إلى Client
- لا تضع `"use client"` في layout كبير إلا عند الضرورة

## 3.3 Route Groups
استخدام `(auth)` و `(dashboard)` ممتاز لأنه:
- يفصل سياقات الواجهة
- يسمح بlayouts مختلفة لكل مجموعة
- ينظم المشروع وظيفياً بدل التنظيم المسطح

## 3.4 Proxy في Next 16
مشروعك يستخدم `proxy.ts` بطريقة صحيحة لحماية المسارات.
المكاسب:
- منع الوصول المبكر قبل rendering
- redirect ذكي بين `/`, `/login`, `/home`
- فحص role-based access قبل فتح route

هذا أقوى من الاعتماد فقط على حارس client-side.

---

## 4) إدارة البيانات في مشروعك (React Query + Axios)

## 4.1 React Query v5 كنمط رئيسي
في `Providers.tsx` عندك QueryClient بإعدادات معقولة:
- `staleTime` و `gcTime`
- إيقاف refetch غير الضروري عند focus/reconnect/mount
- retry محدود

هذا يقلل الضوضاء الشبكية ويحسن UX.

## 4.2 Axios Client مركزي
`lib/api-client.ts` يوفر:
- `withCredentials: true`
- Authorization header في dev عند الحاجة
- التقاط 401 وتصفير الجلسة + redirect إلى login

هذا ممتاز لأنه يمنع تكرار منطق auth داخل كل hook.

## 4.3 hooks حسب الدومين
أسلوب `useEmployees` جيد لأنه:
- يجمع query + mutations في Hook واحد
- يوحّد عرض الأخطاء للمستخدم
- يقوم normalize لقيم رقمية (`hourlyRate`) قبل إرسالها

هذه نقطة نضج مهمة في فصل طبقة العرض عن منطق الـ API.

---

## 5) الحالة العالمية (Zustand) ومتى تستخدمها

`auth-store.ts` عندك مناسب جداً لـ:
- بيانات المستخدم الحالية
- حالة authentication
- فحص الأدوار

قاعدة ذهبية:
- Zustand للحالة المحلية للتطبيق (auth/ui state)
- React Query لبيانات السيرفر

لا تخلطهم. لا تخزن نتائج API الضخمة في Zustand.

---

## 6) الأمان في الفرونت (كما هو مطبق + ما يجب إضافته)

### مطبق حالياً بشكل جيد
- Cookie-based auth + withCredentials
- 401 handling مركزي
- Route-level role checks عبر `proxy.ts` و `route-access.ts`

### يجب تحسينه
- عدم الاعتماد على حماية الفرونت فقط: كل endpoint يجب أن يتحقق من role في الباك
- توحيد سياسة logout/unauthorized عبر event واحد واضح
- إضافة CSRF strategy إن كانت سياسة الكوكيز cross-site في الإنتاج

---

## 7) الأداء (Performance) — ما لديك وما يجب إضافته

## 7.1 الموجود حالياً
- إعدادات React Query تقلل refetch
- فصل routes في app segments
- سكربت analyze موجود (`npm run analyze`)

## 7.2 تحسينات لازم تعتمدها
1. تقليل Client Components:
- كل `"use client"` يضيف JavaScript للمتصفح
- انقل المنطق غير التفاعلي إلى Server Components

2. Dynamic import للأجزاء الثقيلة:
- الجداول الكبيرة
- النوافذ المعقدة
- الرسوم/التحليلات

3. تحسين الصور والخطوط:
- استخدم `next/image` لكل الصور المرئية
- استخدم `next/font` بدل تحميل خطوط عشوائي

4. تقليل الطلبات المتكررة:
- ثبّت query keys
- استخدم invalidation دقيق وليس شامل

5. راقب مؤشرات Web Vitals:
- LCP, INP, CLS
- اربطها مع `WebVitalsReporter.tsx`

---

## 8) الجودة والاختبارات

### ما هو موجود
- Vitest حاضر في المشروع
- سكربتات quality: lint + typecheck + build عبر `verify`

### ما يجب إضافته لتصبح قوي جداً
- اختبارات UI حرجة (login + guard + redirects)
- اختبار hooks الأساسية (employees/payroll/import)
- اختبار smoke لكل route مهم بعد build
- بناء CI pipeline يشغل:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

---

## 9) ماذا تستخدم الآن vs ماذا يجب استخدامه

| المحور | مستخدم الآن | يجب الاستمرار | يجب إضافته |
|---|---|---|---|
| Routing | App Router + route groups | نعم | تحسين تنظيم nested layouts |
| Data Fetching | React Query + Axios | نعم | مزج ذكي مع server fetch حيث يناسب |
| State | Zustand (auth) | نعم | تجنب توسيعه لبيانات السيرفر |
| Auth | Cookie + proxy guard | نعم | توحيد events + CSRF strategy |
| Styling | Tailwind v4 | نعم | Design tokens أوضح + نمط موحّد |
| Performance | Query tuning + analyze | نعم | Dynamic imports + Server Components أكثر |
| Testing | Vitest | نعم | e2e/smoke لاختبار المسارات الحرجة |

---

## 10) خطة تعلم عملية Next.js (مخصصة لخبرتك بـ React)

## المرحلة 1 (3-5 أيام): ترجمة React إلى App Router
- فهم layouts/segments/boundaries
- إعادة تصنيف كل صفحة: Server أو Client
- تمرين: تقليل `"use client"` في 2-3 صفحات

## المرحلة 2 (5-7 أيام): Data & Auth architecture
- تحديد قواعد متى تستخدم React Query ومتى fetch على السيرفر
- تحسين error model موحد لكل hooks
- توثيق lifecycle المصادقة بالكامل (login/me/logout/401)

## المرحلة 3 (5-7 أيام): Performance hardening
- تشغيل `npm run analyze` وتوثيق أكبر 10 bundles
- تطبيق dynamic import على الأجزاء الثقيلة
- مراجعة LCP/INP عبر قياسات فعلية

## المرحلة 4 (5 أيام): Testing & release readiness
- كتابة اختبارات للمسارات الحساسة
- بناء checklist قبل أي release
- توثيق خطوات استرجاع سريعة عند الأعطال

---

## 11) Checklist إلزامي قبل أي تسليم Frontend

- [ ] `npm run lint` بدون أخطاء
- [ ] `npm run typecheck` بدون أخطاء
- [ ] `npm run test` يمر
- [ ] `npm run build` يمر
- [ ] التحقق من login/logout/unauthorized flow
- [ ] التحقق من كل route محمي حسب role
- [ ] التحقق من أداء الصفحة الرئيسية وصفحات الجداول الكبيرة
- [ ] التحقق من رسائل الخطأ للمستخدم (واضحة ومفهومة)

---

## 12) مقارنة نهائية (Frontend Next.js vs Backend NestJS)

> هذه المقارنة لتثبيت الصورة الذهنية الكاملة عندك بين الجهتين.

| البند | Next.js (Frontend) | NestJS (Backend) |
|---|---|---|
| الدور الرئيسي | عرض UI + تجربة المستخدم + إدارة الحالة | قواعد العمل + الأمان + البيانات + API |
| الأساس الفكري | Components + Routing + Rendering strategies | Modules + Controllers + Services + DI |
| محور الجودة | UX, Performance, Accessibility | Correctness, Security, Scalability |
| أخطر مشاكل | re-render زائد، JS bundle كبير، hydration issues | منطق أعمال خاطئ، ثغرات صلاحيات، مشاكل DB/queue |
| أدواتك الحالية | React Query, Zustand, Tailwind, Axios | Prisma, JWT, Guards, BullMQ, Validation |
| نقطة الحسم | سرعة ووضوح الواجهة | دقة القواعد وسلامة البيانات |
| أسلوب التطوير الأفضل | UI slices + reusable hooks | Domain modules + strict DTO/contracts |

### ترجمة خبرتك السابقة
- React -> Next: أنت قريب جداً، الفرق الأكبر هو Server/Client boundaries وApp Router.
- Express -> Nest: أنت قريب أيضاً، لكن Nest أكثر صرامة وتنظيماً (DI + modules + decorators).

### القاعدة الذهبية للعمل بينهما
- Frontend يطلب فقط ما يحتاجه UI.
- Backend يفرض القواعد دائماً حتى لو frontend أخطأ.
- العقد بينهما (DTO/response contracts) يجب أن يكون واضحاً وثابتاً.

---

## 13) ماذا ستكسب لو التزمت بهذا الدليل

- انتقال سريع من مستوى React Developer إلى Next.js Architect عملي.
- واجهة أسرع وأكثر استقراراً مع ضوضاء أقل في الشبكة.
- تكامل أنظف مع NestJS بدون أخطاء contracts متكررة.
- جاهزية أعلى للنشر والإنتاج.

---

## 14) أوامر يومية مقترحة (Frontend)

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run analyze
```

> استخدم `npm run verify` قبل أي دمج مهم لأنه يجمع lint + typecheck + build.
