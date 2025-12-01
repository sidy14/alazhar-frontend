'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. استيراد أداة التنقل
import api from '../lib/api';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter(); // <-- 2. تفعيل الأداة
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      
      // 3. بدلاً من التنبيه، انتقل للوحة التحكم
      router.push('/dashboard'); 

    } catch (err: any) {
      console.error(err);
      setError('بيانات الدخول غير صحيحة، حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // ... (باقي كود التصميم كما هو تماماً دون تغيير) ...
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4" dir="rtl">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">مؤسسة الأزهر الإسلامية</h1>
          <p className="text-gray-500">نظام الإدارة الموحد</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">اسم المستخدم</label>
            <div className="relative">
              <span className="absolute right-3 top-3 text-gray-400">
                <User size={20} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 pr-10 text-right focus:border-blue-500 focus:ring-blue-500"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">كلمة المرور</label>
            <div className="relative">
              <span className="absolute right-3 top-3 text-gray-400">
                <Lock size={20} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 pr-10 text-right focus:border-blue-500 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}