'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { GraduationCap, Save, Loader2, Filter } from 'lucide-react';

interface Branch { id: string; nameAr: string; }
interface Stage { id: number; nameAr: string; }
interface Classroom { id: string; name: string; educationSystemId: number; branchId: string; level: { stage: Stage; } }

export default function StudentsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]); 
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [stages, setStages] = useState<Stage[]>([]); 
  const [loading, setLoading] = useState(true);

  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    uniqueId: '',
    gender: 'MALE', // <-- (جديد)
    birthDate: '',
    birthPlace: '',
    branchId: '',
    parentName: '',
    parentPhone: '',
    classroomId: '',
    seatNumber: '',
    financialStatus: 'FULL',
    academicYearId: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, classRes] = await Promise.all([
          api.get('/branches'),
          api.get('/classrooms')
        ]);
        setBranches(branchRes.data);
        setAllClassrooms(classRes.data);
        const uniqueStages = new Map();
        classRes.data.forEach((c: Classroom) => { if (c.level?.stage) uniqueStages.set(c.level.stage.id, c.level.stage); });
        setStages(Array.from(uniqueStages.values()));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allClassrooms;
    if (formData.branchId) filtered = filtered.filter(c => c.branchId === formData.branchId);
    if (selectedSystem) filtered = filtered.filter(c => c.educationSystemId === Number(selectedSystem));
    if (selectedStage) filtered = filtered.filter(c => c.level.stage.id === Number(selectedStage));
    setFilteredClassrooms(filtered);
  }, [formData.branchId, selectedSystem, selectedStage, allClassrooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', {
        ...formData,
        branchId: Number(formData.branchId),
        classroomId: Number(formData.classroomId),
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      });
      alert('تم تسجيل الطالب بنجاح!');
      setFormData(prev => ({ ...prev, fullName: '', uniqueId: '', seatNumber: '' }));
    } catch (err: any) { alert('حدث خطأ! ربما رقم التسلسل مكرر؟'); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <h1 className="mb-8 text-3xl font-bold text-gray-800 flex items-center gap-2"><GraduationCap /> تسجيل طالب جديد</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        {/* قسم الفلترة */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <h3 className="text-md font-bold text-blue-800 mb-4 flex items-center gap-2"><Filter size={18}/> تحديد المسار الدراسي</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div><label className="block text-sm font-medium mb-1">الفرع</label><select required className="w-full border p-2 rounded bg-white" value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})}><option value="">-- اختر الفرع --</option>{branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">النظام التعليمي</label><select className="w-full border p-2 rounded bg-white" value={selectedSystem} onChange={e => setSelectedSystem(e.target.value)}><option value="">-- الكل --</option><option value="1">عربي إسلامي</option><option value="2">عربي فرنسي (مزدوج)</option></select></div>
            <div><label className="block text-sm font-medium mb-1">المرحلة الدراسية</label><select className="w-full border p-2 rounded bg-white" value={selectedStage} onChange={e => setSelectedStage(e.target.value)}><option value="">-- الكل --</option>{stages.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">الفصل الدراسي</label><select required className="w-full border p-2 rounded bg-white" value={formData.classroomId} onChange={e => setFormData({...formData, classroomId: e.target.value})}><option value="">-- اختر الفصل --</option>{filteredClassrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
        </div>

        {/* الأرقام */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div><label className="block text-sm font-bold mb-1">رقم التسلسل (المدرسة)</label><input required className="w-full border p-2 rounded bg-gray-50" placeholder="مثال: 2025/001" value={formData.uniqueId} onChange={e => setFormData({...formData, uniqueId: e.target.value})} /></div>
          <div><label className="block text-sm font-bold mb-1">رقم الجلوس (الفصل)</label><input required className="w-full border p-2 rounded bg-gray-50" placeholder="مثال: 1, 2, 3..." value={formData.seatNumber} onChange={e => setFormData({...formData, seatNumber: e.target.value})} /></div>
        </div>

        {/* البيانات الشخصية */}
        <div className="grid gap-6 md:grid-cols-4 mb-6 border-t pt-4"> {/* تعديل الأعمدة لـ 4 */}
          <div><label className="block text-sm font-medium mb-1">الاسم الكامل</label><input required className="w-full border p-2 rounded" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
          
          {/* حقل الجنس الجديد */}
          <div>
            <label className="block text-sm font-medium mb-1">الجنس</label>
            <select required className="w-full border p-2 rounded bg-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </div>

          <div><label className="block text-sm font-medium mb-1">تاريخ الميلاد</label><input type="date" className="w-full border p-2 rounded" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">مكان الميلاد</label><input className="w-full border p-2 rounded" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} /></div>
        </div>

        {/* ولي الأمر والمالية (كما هي) */}
        <div className="grid gap-6 md:grid-cols-2 mb-6 border-t pt-4">
          <div><label className="block text-sm font-medium mb-1">اسم الولي</label><input required className="w-full border p-2 rounded" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">رقم الهاتف</label><input required className="w-full border p-2 rounded" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} /></div>
        </div>
        <div className="mb-6"><label className="block text-sm font-medium mb-1">الحالة المالية</label><select required className="w-full border p-2 rounded bg-white" value={formData.financialStatus} onChange={e => setFormData({...formData, financialStatus: e.target.value})}><option value="FULL">رسوم كاملة</option><option value="HALF">نصف منحة</option><option value="EXEMPT">معفى</option></select></div>

        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"><Save /> حفظ وتسجيل الطالب</button>
      </form>
    </div>
  );
}