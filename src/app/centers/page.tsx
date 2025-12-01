'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Building2, MapPin, Loader2, Plus, X } from 'lucide-react';

interface Center {
  id: string;
  nameAr: string;
  nameFr: string;
  address: string;
}

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // لإظهار/إخفاء النموذج
  
  // بيانات النموذج الجديد
  const [formData, setFormData] = useState({ nameAr: '', nameFr: '', address: '' });

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers'); 
      setCenters(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/centers', formData); // إرسال للخلفية
      setShowForm(false); // إغلاق النموذج
      setFormData({ nameAr: '', nameFr: '', address: '' }); // تنظيف الحقول
      fetchCenters(); // تحديث القائمة فوراً
      alert('تم إنشاء المركز بنجاح!');
    } catch (err) {
      alert('حدث خطأ أثناء الإنشاء');
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 /> إدارة المراكز
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> إضافة مركز
        </button>
      </div>

      {/* نموذج الإضافة (يظهر فقط عند الضغط) */}
      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <h3 className="font-bold text-lg mb-4">بيانات المركز الجديد</h3>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
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
              className="border p-2 rounded"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2">إلغاء</button>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">حفظ</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {centers.map((center) => (
          <div key={center.id} className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition border-r-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800">{center.nameAr}</h2>
            <h3 className="text-gray-500 text-sm mb-4">{center.nameFr}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={16} className="ml-1" />
              <span>{center.address || 'لا يوجد عنوان'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}