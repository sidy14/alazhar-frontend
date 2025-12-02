'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, Lock, Power, Loader2, ShieldAlert, RefreshCw } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // للتحكم في نافذة تغيير الباسورد
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      alert('فشل جلب قائمة المستخدمين. تأكد أنك "مدير عام".');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // وظيفة تغيير كلمة المرور
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    try {
      await api.patch(`/users/${resetUserId}/reset-password`, { password: newPassword });
      alert('تم تغيير كلمة المرور بنجاح ✅');
      setResetUserId(null);
      setNewPassword('');
    } catch (err) {
      alert('حدث خطأ أثناء التغيير');
    }
  };

  // وظيفة تفعيل/تعطيل الحساب
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if(!confirm(currentStatus ? 'هل أنت متأكد من تعطيل هذا الحساب؟ لن يتمكن المستخدم من الدخول.' : 'هل تريد إعادة تفعيل الحساب؟')) return;
    
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      // تحديث القائمة محلياً لتعكس التغيير
      setUsers(users.map(u => u.id === userId ? {...u, isActive: !u.isActive} : u));
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <ShieldAlert className="text-red-600"/> إدارة المستخدمين والأمان
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4">الاسم الكامل</th>
              <th className="p-4">اسم المستخدم</th>
              <th className="p-4">الصلاحية (الدور)</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ الإنشاء</th>
              <th className="p-4">إجراءات الأمان</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-800">{user.fullName}</td>
                <td className="p-4 font-mono text-blue-600 bg-blue-50 inline-block rounded px-2 my-2 mx-2 text-sm">{user.username}</td>
                <td className="p-4">
                   {/* عرض أول دور للمستخدم أو نوع حسابه */}
                   <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                     {user.assignments[0]?.role?.roleName || user.accountType}
                   </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 flex gap-3 items-center">
                  <button 
                    onClick={() => setResetUserId(user.id)}
                    className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm border border-gray-300 px-3 py-1 rounded hover:bg-blue-50"
                    title="تغيير كلمة المرور"
                  >
                    <Lock size={14} /> تغيير الباسورد
                  </button>
                  
                  <button 
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={`flex items-center gap-1 text-sm border px-3 py-1 rounded ${user.isActive ? 'text-red-500 border-red-200 hover:bg-red-50' : 'text-green-500 border-green-200 hover:bg-green-50'}`}
                    title={user.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                  >
                    <Power size={14} /> {user.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* نافذة تغيير الباسورد المنبثقة (Modal) */}
      {resetUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
              <RefreshCw className="text-blue-600"/> تعيين كلمة مرور جديدة
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              أنت على وشك تغيير كلمة المرور للمستخدم. يرجى إدخال الكلمة الجديدة بعناية.
            </p>
            <input 
              type="text" 
              placeholder="كلمة المرور الجديدة..." 
              className="w-full border-2 border-gray-200 p-3 rounded-lg mb-4 focus:border-blue-500 focus:outline-none font-mono"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => {setResetUserId(null); setNewPassword('')}} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg">إلغاء</button>
              <button onClick={handleResetPassword} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-lg">حفظ التغيير</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}