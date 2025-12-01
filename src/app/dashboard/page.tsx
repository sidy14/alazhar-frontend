'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // أداة التنقل
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // التحقق من وجود "بطاقة الهوية" عند فتح الصفحة
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      // إذا لم يوجد توكن، ارجع لصفحة الدخول
      router.push('/');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // رمي البطاقة
    router.push('/'); // العودة للدخول
  };

  if (!token) return null; // لا تظهر شيئاً حتى نتأكد

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* الشريط العلوي */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">لوحة التحكم - الأزهر</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600"
            >
              <span className="ml-2">تسجيل الخروج</span>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border-4 border-dashed border-gray-200 p-10 text-center h-96 flex flex-col items-center justify-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <User size={48} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">مرحباً بك في النظام!</h2>
            <p className="mt-2 text-gray-600">هذه هي الصفحة الرئيسية للوحة التحكم.</p>
            <p className="text-sm text-gray-400 mt-4">أنت متصل الآن بآمان.</p>
          </div>
        </div>
      </main>
    </div>
  );
}