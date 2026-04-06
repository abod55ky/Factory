// // تعريف شكل بيانات الموظف بناءً على كود الباك إند
// export interface Employee {
//   _id: string;               // معرف قاعدة البيانات
//   employeeId: string;        // كود الموظف (مثلاً EMP001)
//   name: string;              // الاسم
//   email?: string;
//   phone?: string;
//   hourlyRate: {              // الباك إند يرسل الراتب بهذا الشكل (Decimal)
//     $numberDecimal: string; 
//   } | number;                // أو رقم عادي
//   currency: string;
//   department: string;        // القسم (Warehouse, HR, إلخ)
//   status: 'active' | 'inactive' | 'on_leave' | 'terminated';
//   scheduledStart: string;    // وقت البدء
//   scheduledEnd: string;      // وقت الانتهاء
// }

export interface Employee {
  id: string;
  employeeId: string; // مثل EMP001
  name: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  // الراتب يأتي من الباك إند كـ Decimal، وغالباً يصل للفرونت كـ string أو كائن
  hourlyRate: any; 
  avatar?: string;
}