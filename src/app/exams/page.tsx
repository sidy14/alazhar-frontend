'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { BookOpen, Plus, Save, Loader2, UserCheck, ArrowRight } from 'lucide-react';

export default function ExamsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignId, setSelectedAssignId] = useState('');
  
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTerm, setExamTerm] = useState('FIRST_TERM'); // <-- (جديد) الفترة
  const [maxScore, setMaxScore] = useState('20');
  
  const [currentExamId, setCurrentExamId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]); 
  const [marks, setMarks] = useState<Record<number, string>>({}); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const res = await api.get('/hr/my-assignments');
        setAssignments(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchMyClasses();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAssignment = assignments.find(a => String(a.id) === String(selectedAssignId));
    if (!selectedAssignId || !targetAssignment) { alert("الرجاء اختيار الفصل!"); return; }

    try {
      const res = await api.post('/exams', {
        name: examName,
        examDate: new Date(examDate).toISOString(),
        term: examTerm, // <-- (جديد)
        maxScore: Number(maxScore),
        classroomId: Number(targetAssignment.classroomId),
        subjectId: Number(targetAssignment.subjectId),
        examTypeId: 1
      });
      try {
        const studentsRes = await api.get(`/students?classroomId=${targetAssignment.classroomId}`);
        setStudents(studentsRes.data);
      } catch (err) { console.error(err); }

      alert('تم إنشاء الورقة بنجاح!');
      setCurrentExamId(res.data.id); 
    } catch (err) { alert('فشل إنشاء الامتحان'); }
  };

  const handleSubmitMarks = async () => {
    if (!currentExamId) return;
    const marksData = Object.entries(marks).map(([studentId, score]) => ({
      studentId: Number(studentId),
      score: Number(score)
    }));
    try {
      await api.post(`/exams/${currentExamId}/marks`, { marks: marksData });
      alert('تم حفظ الدرجات بنجاح! ✅');
      setCurrentExamId(null);
      setExamName('');
      setMarks({});
    } catch (err) { alert('حدث خطأ في الحفظ'); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <h1 className="mb-8 text-3xl font-bold text-gray-800 flex items-center gap-2"><BookOpen /> لوحة الأستاذ (الامتحانات)</h1>

      {!currentExamId ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto border border-blue-100">
          <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2"><Plus size={20}/> إنشاء امتحان جديد</h2>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">اختر الفصل والمادة</label>
              <select className="w-full border p-3 rounded-lg bg-gray-50" value={selectedAssignId} onChange={(e) => setSelectedAssignId(e.target.value)} required>
                <option value="">-- اختر من جدولك --</option>
                {assignments.map(a => <option key={a.id} value={a.id}>{a.classroom.name} - {a.subject.nameAr}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-1">اسم الامتحان</label><input required className="w-full border p-2 rounded" placeholder="مثال: الفرض الأول" value={examName} onChange={e => setExamName(e.target.value)} /></div>
              <div><label className="block text-sm font-bold mb-1">تاريخ الامتحان</label><input required type="date" className="w-full border p-2 rounded" value={examDate} onChange={e => setExamDate(e.target.value)} /></div>
            </div>
            
            {/* حقل الفترة الجديد */}
            <div>
               <label className="block text-sm font-bold mb-1">الفترة الدراسية</label>
               <select className="w-full border p-2 rounded" value={examTerm} onChange={e => setExamTerm(e.target.value)}>
                 <option value="FIRST_TERM">الفترة الأولى</option>
                 <option value="SECOND_TERM">الفترة الثانية</option>
                 <option value="THIRD_TERM">الفترة الثالثة</option>
               </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition">بدء الامتحان ورصد الدرجات</button>
          </form>
        </div>
      ) : (
        // ... (جزء الرصد كما هو تماماً) ...
        <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto animate-fade-in border-t-4 border-green-500">
           {/* (للاختصار لم أكرر كود الرصد هنا، لكن يجب نسخه من الملف السابق) */}
           {/* إذا نسخته، تأكد من وضع كود الرصد هنا كما كان */}
           <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-green-700">{examName}</h2>
              <p className="text-gray-500">عدد الطلاب: {students.length}</p>
            </div>
            <button onClick={() => setCurrentExamId(null)} className="text-gray-500 hover:text-red-500 flex items-center gap-1">
              <ArrowRight size={18}/> إلغاء وعودة
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
             {students.length > 0 ? students.map(student => (
               <div key={student.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded hover:bg-gray-100 transition border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold"><UserCheck size={20} /></div>
                  <div className="flex-1"><h3 className="font-bold text-gray-800">{student.fullName}</h3><p className="text-xs text-gray-500">رقم: {student.uniqueId}</p></div>
                  <div className="w-32"><input type="number" max={maxScore} className="w-full border-2 border-blue-200 p-2 rounded text-center font-bold text-blue-800" placeholder="0" onChange={e => setMarks({...marks, [student.id]: e.target.value})} /></div>
               </div>
             )) : <div className="text-center py-10 bg-yellow-50 rounded-lg">⚠️ لا يوجد طلاب.</div>}
          </div>
          <button onClick={handleSubmitMarks} disabled={students.length === 0} className="w-full bg-green-600 text-white py-4 rounded-lg mt-8 hover:bg-green-700 font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"><Save /> حفظ واعتماد الدرجات</button>
        </div>
      )}
    </div>
  );
}