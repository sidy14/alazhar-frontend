'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, Lock, Power, Loader2, ShieldAlert, RefreshCw, Plus, Save, X } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات النوافذ المنبثقة
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false); // نافذة الإضافة

  // بيانات الموظف الجديد
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    accountType: 'STAFF', // الافتراضي
    staffIdNumber: '',
    jobTitle: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 1. وظيفة إضافة مستخدم جديد (تستدعي HR API)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/staff', formData);
      alert('تم إضافة المستخدم بنجاح! ✅');
      setShowAddModal(false);
      setFormData({
        username: '', password: '', fullName: '', email: '', 
        phoneNumber: '', accountType: 'STAFF', staffIdNumber: '', jobTitle: ''
      });
      fetchUsers(); // تحديث القائمة
    } catch (err) {
      alert('فشل الإضافة. تأكد من عدم تكرار اسم المستخدم أو البريد.');
    }
  };

  // 2. تغيير كلمة المرور
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
      alert('حدث خطأ');
    }
  };

  // 3. تفعيل/تعطيل الحساب
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if(!confirm(currentStatus ? 'هل أنت متأكد من تعطيل هذا الحساب؟' : 'هل تريد تفعيل الحساب؟')) return;
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      // تحديث محلي سريع
      setUsers(users.map(u => u.id === userId ? {...u, isActive: !u.isActive} : u));
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      
      {/* الرأس مع زر الإضافة */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-red-600"/> إدارة المستخدمين والأمان
        </h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md transition"
        >
          <Plus size={20} /> مستخدم جديد
        </button>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4">الاسم الكامل</th>
              <th className="p-4">اسم المستخدم</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراءات الأمان</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-800">{user.fullName}</td>
                <td className="p-4 font-mono text-blue-600 bg-blue-50 inline-block rounded px-2 my-2 mx-2 text-sm">{user.username}</td>
                <td className="p-4">
                   <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                     {user.assignments[0]?.role?.roleName || user.accountType}
                   </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="p-4 flex gap-3 items-center">
                  <button onClick={() => setResetUserId(user.id)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm border px-2 py-1 rounded">
                    <Lock size={14} /> كلمة المرور
                  </button>
                  <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`flex items-center gap-1 text-sm border px-2 py-1 rounded ${user.isActive ? 'text-red-500 border-red-200' : 'text-green-500 border-green-200'}`}>
                    <Power size={14} /> {user.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* نافذة إضافة مستخدم جديد (Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-bold text-xl text-blue-800 flex items-center gap-2"><Plus /> إضافة موظف جديد</h3>
              <button onClick={() => setShowAddModal(false)}><X className="text-gray-400 hover:text-red-500"/></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
              <div><label className="block text-sm mb-1">الاسم الكامل</label><input required className="w-full border p-2 rounded" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">البريد الإلكتروني</label><input required type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">رقم الهاتف</label><input required className="w-full border p-2 rounded" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">نوع الحساب</label>
                <select className="w-full border p-2 rounded bg-white" value={formData.accountType} onChange={e => setFormData({...formData, accountType: e.target.value})}>
                  <option value="STAFF">إداري / مالي</option>
                  <option value="TEACHER">أستاذ</option>
                </select>
              </div>
              <div><label className="block text-sm mb-1">اسم المستخدم (للدخول)</label><input required className="w-full border p-2 rounded bg-blue-50" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">كلمة المرور</label><input required type="password" className="w-full border p-2 rounded bg-blue-50" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
              
              <div className="md:col-span-2 border-t pt-4 mt-2"><h4 className="font-bold text-gray-500 mb-2 text-sm">بيانات الوظيفة</h4></div>
              <div><label className="block text-sm mb-1">الرقم الوظيفي (ID)</label><input required className="w-full border p-2 rounded" placeholder="مثال: T-2025-005" value={formData.staffIdNumber} onChange={e => setFormData({...formData, staffIdNumber: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">المسمى الوظيفي</label><input required className="w-full border p-2 rounded" placeholder="مثال: محاسب / أستاذ" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} /></div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-500 px-6 py-2 hover:bg-gray-100 rounded">إلغاء</button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 font-bold flex items-center gap-2"><Save size={18}/> حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تغيير الباسورد (كما هي) */}
      {resetUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><RefreshCw className="text-blue-600"/> تعيين كلمة مرور جديدة</h3>
            <input type="text" placeholder="كلمة المرور الجديدة..." className="w-full border-2 border-gray-200 p-3 rounded-lg mb-4 focus:border-blue-500 outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => {setResetUserId(null); setNewPassword('')}} className="text-gray-600 px-4 py-2 rounded">إلغاء</button>
              <button onClick={handleResetPassword} className="bg-red-600 text-white px-6 py-2 rounded font-bold">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}