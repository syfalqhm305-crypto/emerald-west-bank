# 💠 بنك أميرالد الغرب

نسخة أولية لبنك نقابة أميرالد الغرب، مبنية بواجهة HTML/CSS/JavaScript وقاعدة بيانات Supabase.

## الملفات
- `index.html` واجهة البنك وتسجيل الدخول.
- `css/style.css` التصميم.
- `js/config.js` بيانات اتصال Supabase.
- `js/app.js` تسجيل الدخول والرصيد والتحويلات.
- `sql/schema.sql` جداول قاعدة البيانات ودالة التحويل.

## التشغيل
1. أنشئ مشروعًا مجانيًا في Supabase.
2. افتح SQL Editor والصق محتوى `sql/schema.sql` ثم Run.
3. من Project Settings > API انسخ Project URL و anon/public key.
4. ضع القيم في `js/config.js`.
5. ارفع الملفات إلى GitHub.
6. اربط المستودع مع Vercel أو استخدم أي استضافة صفحات ثابتة.

## تنبيه أمني
لا تضع أبدًا `service_role key` داخل HTML أو JavaScript. استخدم anon/public key فقط، واجعل العمليات الحساسة عبر RLS وPostgres functions.
