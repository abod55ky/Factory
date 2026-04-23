# تقرير لفريق الـ Backend — مشكلة 500 في تسجيل الدخول

**تاريخ التقرير:** 2026-04-23  
**المرسل:** فريق Frontend  
**البيئة المتأثرة:** واجهة `factory` عند `POST /api/auth/login` (rewritten إلى `/auth/login` في الـ backend)

## ملخص المشكلة
- في واجهة تسجيل الدخول يظهر:
  - `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`
  - `تعذر الوصول لخادم المصادقة...` (عند انقطاع الشبكة/عدم الوصول)
- المشكلة **متكررة بشكل متقطع** (Intermittent)، وليست خطأ إدخال بيانات فقط.

## ما تم عمله في الفرونت
- توحيد حل عنوان الـ API في:
  - `lib/api-url.ts`
  - `lib/api-client.ts`
  - `next.config.ts`
- ضبط بيئة الفرونت لتعمل على السيرفر المرفوع مباشرة:
  - `.env.local`
  - `.env.example`
- تحسين رسائل الأخطاء في شاشة الدخول (`app/(auth)/login/page.tsx`) لتمييز:
  - أخطاء 4xx (اعتمادات خاطئة)
  - أخطاء 5xx (مشكلة خادم)
  - أخطاء عدم الوصول للشبكة

> النتيجة: أي 500 متبقّي الآن غالبًا سببه داخل الـ backend أو البنية التحتية (وليس من توجيه API في الفرونت).

---

## المطلوب من فريق الـ Backend (إصلاح جذري)

### 1) تتبع سبب 500 بدقة في `POST /api/auth/login`
أضيفوا logging منظم (structured logs) حول نقاط الفشل التالية داخل `AuthService.login`:
- قبل/بعد `prisma.user.findFirst`
- قبل/بعد `bcrypt.compare`
- قبل/بعد `jwtService.signAsync`
- قبل/بعد `prisma.user.update({ lastLogin })`

**الهدف:** عزل المصدر الحقيقي (DB/JWT/Runtime) بدل ظهور 500 عام.

### 2) حماية المسار من فشل قاعدة البيانات/الخدمات التابعة
في حال فشل اتصال DB أو خطأ Prisma:
- لا يرجع 500 صامت.
- ارجع رسالة معيارية مع `requestId`.
- أضفوا retries خفيفة للعمليات القراءة غير الحرجة (بحذر).

### 3) مراجعة إعدادات JWT في بيئة الإنتاج
تحققوا من:
- `JWT_SECRET` موجود وثابت وغير فارغ.
- عدم تغييره تلقائيًا أثناء إعادة النشر.
- `JWT_EXPIRE` صالح.

**سبب محتمل للـ500:** فشل `signAsync` عند إعداد JWT خاطئ/مفقود.

### 4) Cookie/Auth consistency
تحققوا من الاتساق بين:
- `JWT_COOKIE_NAME`
- `JWT_COOKIE_SAME_SITE`
- `JWT_COOKIE_SECURE`
- `AUTH_RETURN_TOKEN_IN_BODY`

### 5) CORS/Proxy على الإنتاج
تأكدوا أن `CORS_ORIGIN` يحتوي أصل الفرونت الفعلي بدون أخطاء كتابة، وأن الطلبات credentials متاحة عند الحاجة.

### 6) مراقبة معدل الأخطاء وإضافة correlation id
- أضيفوا `X-Request-Id` في الردود.
- سجّلوا requestId داخل exception filter.
- تتبعوا معدل `5xx` لمسار `/api/auth/login` و `/api/auth/me`.

### 7) فحوصات إلزامية بعد الإصلاح
- اختبار حمل خفيف على `/api/auth/login` (Concurrent requests) للتأكد من عدم الانهيار المتقطع.
- اختبار سيناريو كلمة مرور صحيحة/خاطئة/حساب locked.
- التأكد أن الاستجابة لا تخرج 500 إلا في حالات حرجة واضحة.

---

## ملاحظات تشخيصية مهمة
- الفرونت الآن يرسل عبر `/api/*` ثم rewrite للـ backend.
- إذا ظهر 500 في Network tab على `/api/auth/login` فهذا يعني غالبًا أن الـ upstream backend رجع 500.
- إذا ظهر `Network Error` بدون status: المشكلة غالبًا انقطاع وصول/بوابة/SSL/DNS.

---

## تعريف النجاح (Definition of Done)
يُعتبر الإصلاح مكتملًا عندما:
1. `POST /api/auth/login` لا يرجع 500 في التشغيل الطبيعي.
2. الأخطاء المتوقعة ترجع 4xx برسائل واضحة (Invalid credentials / Locked account...).
3. لا توجد انقطاعات متقطعة في تسجيل الدخول لمدة اختبار مراقبة متواصل (على الأقل 24 ساعة تشغيل). 
4. يوجد logging كافٍ لتتبع أي فشل مستقبلي خلال دقائق.
