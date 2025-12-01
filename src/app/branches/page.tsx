'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Building, MapPin, Loader2, Plus } from 'lucide-react';

// تعريف أنواع البيانات
interface Branch {
  id: string;
  nameAr: string;
  nameFr: string;
  address: string;
  center: { nameAr: string }; // اسم المركز التابع له
}

interface Center {
  id: string;
  nameAr: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [centers, setCenters] = useState<Center[]>([]); // قائمة المراكز للاختيار منها
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // بيانات النموذج
  const [formData, setFormData] = useState({ 
    nameAr: '', 
    nameFr: '', 
    address: '', 
    centerId: '' // سنخزن رقم المركز هنا
  });

  // جلب البيانات (فروع + مراكز)
  const fetchData = async () => {
    try {
      const [branchesRes, centersRes] = await Promise.all([
        api.get('/branches'),
        api.get('/centers')
      ]);
      setBranches(branchesRes.data);
      setCenters(centersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء فرع جديد
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/branches', {
        ...formData,
        centerId: Number(formData.centerId) // تحويل النص لرقم
      });
      setShowForm(false);
      setFormData({ nameAr: '', nameFr: '', address: '', centerId: '' });
      fetchData(); // تحديث القائمة
      alert('تم إنشاء الفرع بنجاح!');
    } catch (err) {
      alert('حدث خطأ. تأكد من ملء جميع البيانات.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building /> إدارة الفروع
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> إضافة فرع
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <h3 className="font-bold text-lg mb-4">بيانات الفرع الجديد</h3>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            {/* اختيار المركز */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">تابع للمركز:</label>
              <select 
                className="w-full border p-2 rounded bg-white"
                value={formData.centerId}
                onChange={e => setFormData({...formData, centerId: e.target.value})}
                required
              >
                <option value="">-- اختر المركز --</option>
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>

            <input 
              placeholder="الاسم بالعربية" 
              className="border p-2 rounded"
              value={formData.nameAr}
              onChange={e => setFormData({...formData, nameAr: e.target.value})}
              required
            />
            <input 
              placeholder="الاسم بالفرنسية" 
              className="border p-2 rounded"
              value={formData.nameFr}
              onChange={e => setFormData({...formData, nameFr: e.target.value})}
              required
            />
            <input 
              placeholder="العنوان" 
              className="border p-2 rounded md:col-span-2"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
            
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2">إلغاء</button>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">حفظ</button>
            </div>
          </form>
        </div>
      )}

      {/* عرض الفروع */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition border-r-4 border-green-500">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-800">{branch.nameAr}</h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {branch.center?.nameAr || 'غير مرتبط'}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-4">{branch.nameFr}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={16} className="ml-1" />
              <span>{branch.address || 'لا يوجد عنوان'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}