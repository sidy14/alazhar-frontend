'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, Plus, Save, Loader2 } from 'lucide-react';

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [resources, setResources] = useState<any>({ branches: [], levels: [], systems: [], years: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    branchId: '',
    levelId: '',
    educationSystemId: '',
    academicYearId: '',
    capacity: '35'
  });

  // جلب البيانات
  const fetchData = async () => {
    try {
      const [listRes, resRes] = await Promise.all([
        api.get('/classrooms'),           // جلب الفصول الموجودة
        api.get('/classrooms/resources')  // جلب القوائم المنسدلة
      ]);
      setClassrooms(listRes.data);
      setResources(resRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classrooms', {
        name: formData.name,
        capacity: Number(formData.capacity),
        branchId: Number(formData.branchId),
        levelId: Number(formData.levelId),
        educationSystemId: Number(formData.educationSystemId),
        academicYearId: Number(formData.academicYearId),
      });
      alert('تم إنشاء الفصل بنجاح!');
      setShowForm(false);
      setFormData({ ...formData, name: '' }); // تنظيف الاسم فقط
      fetchData(); // تحديث القائمة
    } catch (err) {
      alert('حدث خطأ أثناء الإنشاء');
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
          <Users /> إدارة الفصول الدراسية
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} /> فصل جديد
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-blue-100 grid gap-4 md:grid-cols-3">
          
          <div>
            <label className="block text-sm mb-1">اسم الفصل (الفوج)</label>
            <input required className="w-full border p-2 rounded" placeholder="مثال: الفوج ب" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm mb-1">الفرع</label>
            <select required className="w-full border p-2 rounded bg-white" value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})}>
              <option value="">-- اختر --</option>
              {resources.branches.map((b: any) => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">النظام التعليمي</label>
            <select required className="w-full border p-2 rounded bg-white" value={formData.educationSystemId} onChange={e => setFormData({...formData, educationSystemId: e.target.value})}>
              <option value="">-- اختر --</option>
              {resources.systems.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">المرحلة / المستوى</label>
            <select required className="w-full border p-2 rounded bg-white" value={formData.levelId} onChange={e => setFormData({...formData, levelId: e.target.value})}>
              <option value="">-- اختر --</option>
              {resources.levels.map((l: any) => (
                <option key={l.id} value={l.id}>{l.stage.nameAr} - {l.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">السنة الدراسية</label>
            <select required className="w-full border p-2 rounded bg-white" value={formData.academicYearId} onChange={e => setFormData({...formData, academicYearId: e.target.value})}>
              <option value="">-- اختر --</option>
              {resources.years.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">سعة الفصل</label>
            <input type="number" className="w-full border p-2 rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button type="submit" className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 flex gap-2 items-center">
              <Save size={18}/> حفظ الفصل
            </button>
          </div>
        </form>
      )}

      {/* جدول الفصول */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classrooms.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-lg shadow-sm border-r-4 border-purple-500 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{c.branch.nameAr}</span>
            </div>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>📚 {c.educationSystem.nameAr}</p>
              <p>🎓 {c.level.stage.nameAr} - {c.level.nameAr}</p>
              <p>📅 {c.academicYear.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}