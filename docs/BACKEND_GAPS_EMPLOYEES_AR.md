# تقرير نواقص وتعارضات Backend — تدفّق الموظفين

**التاريخ:** 2026-04-23  
**النطاق:** `employees fetch` + `AddEmployeeModal` + `FireEmployeeModal`  
**ملاحظة:** لم يتم تعديل أي ملف Backend، الإصلاحات كانت Frontend فقط.

---

## 1) حالة الربط الحالية من الفرونت

### A) Fetch الموظفين
- الفرونت يستدعي: `GET /employees`
- تم دعم شكلين من الاستجابة في الفرونت:
  1. `{ employees: [...], pagination: ... }`
  2. `[...]` (array مباشر)

### B) AddEmployeeModal
- الفرونت يرسل payload متوافق مع DTO الحالي للباك:
  - `employeeId`, `name`, `email`, `mobile`, `hourlyRate`, `roleId`, `department`, `scheduledStart`, `scheduledEnd`
- يتم توليد `email` fallback عند عدم وجوده.
- الحقول الإضافية في UI (مثل `age`, `gender`, `jobTitle`, `monthlySalary`, `livingAllowance`) لا يتم حفظ معظمها في backend الحالي لأنها غير موجودة في DTO/Model.

### C) FireEmployeeModal
- تم ربطه على backend بدون حذف نهائي:
  - `PUT /employees/:employeeId`
  - payload: `{ status: "terminated", terminationDate: fireDate }`
- هذا أفضل من `DELETE` لأنه يحافظ على بيانات الموظف ويجعله يظهر ضمن "المستقيلون".

---

## 2) النواقص الفعلية في Backend (حسب DTO + Prisma)

## الحقول غير مدعومة في `Employee` حاليًا
- `age`
- `gender`
- `jobTitle`
- `monthlySalary`
- `livingAllowance`
- سبب/ملاحظات الإقالة (`terminationReason`, `terminationNotes`) غير موجودة أيضًا.

## تعارضات وظيفية مهمة
1. **الإقالة المحاسبية غير مكتملة في الباك**
   - مودال الإقالة يجمع: السبب، الملاحظات، المكافأة، المستحقات.
   - الباك لا يملك endpoint/DTO لحفظ هذه التفاصيل.
   - المتاح فقط فعليًا: تغيير `status` و`terminationDate`.

2. **المسمى الوظيفي غير محفوظ**
   - UI يعرض/يدخل `jobTitle`.
   - الباك لا يملك عمودًا/حقلًا لهذا الاسم داخل `Employee`.

3. **الراتب الشهري مقابل أجر الساعة**
   - الباك يعتمد `hourlyRate` فقط داخل `Employee`.
   - الـ UI يعمل بمنطق `monthlySalary` في بعض الشاشات.
   - هذا يسبب تضارب في العرض/الحساب إن لم يوجد mapping واضح أو schema موحد.

4. **صلاحيات الأدوار في الإضافة**
   - `AddEmployeeModal` يجلب `/auth/roles`.
   - إن لم يملك المستخدم صلاحية `manage_roles` سيفشل الجلب.
   - لا يوجد endpoint بديل "آمن" لقراءة أدوار قابلة للاستخدام أثناء إضافة موظف.

---

## 3) أخطاء/مخاطر محتملة يجب متابعتها في Backend

1. **ثبات شكل استجابة `/employees`**
   - يرجى توحيد شكل الرد (إما object paginated دائمًا أو array دائمًا).
   - الاختلاط الحالي يزيد احتمالية كسر الواجهة مستقبلاً.

2. **غياب endpoint لإنهاء الخدمة مع تفاصيل مالية وإدارية**
   - المطلوب endpoint واضح مثل:
   - `POST /employees/:id/terminate`
   - يقبل: `terminationDate`, `reason`, `notes`, `bonus`, `dueSalary`, `totalDues`, وربط مع قيود محاسبية إذا لزم.

3. **غياب حقول HR أساسية**
   - العمر/الجنس/المسمى الوظيفي في UI بدون تخزين backend.
   - يلزم قرار: إضافتها في `Employee` أو نقلها لكيان HR profile منفصل.

---

## 4) توصية تنفيذية مختصرة لفريق الباك

- توحيد API contract لمسار `GET /employees`.
- إضافة تدفّق termination رسمي (soft terminate + metadata).
- حسم نموذج البيانات للراتب (`hourlyRate` vs `monthlySalary`).
- إضافة/اعتماد الحقول HR المطلوبة (age/gender/jobTitle/livingAllowance) أو إلغاءها من UI رسميًا.

---

## 5) تعريف النجاح (DoD)

- إضافة موظف تعمل دائمًا بدون فقدان حقول متوقعة.
- إنهاء الخدمة يحفظ السبب والتاريخ والمستحقات وليس فقط status.
- شكل استجابة `/employees` ثابت ومُوثق.
- لا يوجد اختلاف بين ما يُدخل في الواجهة وما يُخزّن فعليًا في قاعدة البيانات.
