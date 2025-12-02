'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Printer, Loader2, Trophy } from 'lucide-react';

export default function ResultsWallPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<any[]>([]);
  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bRes, cRes] = await Promise.all([api.get('/branches'), api.get('/classrooms')]);
        setBranches(bRes.data);
        setClassrooms(cRes.data);
      } catch (err) {
        console.error("Failed to load data");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      setFilteredClassrooms(classrooms.filter(c => String(c.branchId) === selectedBranch));
    } else {
      setFilteredClassrooms([]);
    }
  }, [selectedBranch, classrooms]);

  const handleShowResults = async () => {
    if (!selectedClassroom) return;
    setLoading(true);
    try {
      const res = await api.get(`/classrooms/${selectedClassroom}/results`);
      setData(res.data);
    } catch (err) {
      alert('حدث خطأ أثناء جلب النتائج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 print:bg-white print:p-0 font-serif" dir="rtl">
      
      {/* شريط التحكم (يختفي عند الطباعة) */}
      <div className="max-w-5xl mx-auto mb-8 print:hidden bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" /> لوحة النتائج (للتعليق)
        </h1>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">الفرع</label>
            <select className="w-full border p-2 rounded" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
              <option value="">-- اختر الفرع --</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">الفصل الدراسي</label>
            <select className="w-full border p-2 rounded" value={selectedClassroom} onChange={e => setSelectedClassroom(e.target.value)}>
              <option value="">-- اختر الفصل --</option>
              {filteredClassrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={handleShowResults} disabled={loading || !selectedClassroom} className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900 h-10">
            {loading ? 'جاري التحميل...' : 'عرض النتائج'}
          </button>
          {data && (
            <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-black h-10 flex items-center gap-2">
              <Printer size={16} /> طباعة
            </button>
          )}
        </div>
      </div>

      {/* ورقة النتائج (A4 Landscape) */}
      {data && (
        <div className="max-w-[297mm] mx-auto bg-white p-8 shadow-lg print:shadow-none print:w-full print:max-w-none">
          
          {/* الترويسة */}
          <div className="text-center border-b-4 border-double border-black pb-4 mb-4">
            <h2 className="text-xl font-bold">مؤسسة الأزهر الإسلامية للتربية والتعليم</h2>
            <h3 className="text-lg">فرع: {data.classroom?.branch?.nameAr}</h3>
            <h1 className="text-3xl font-black mt-2 underline decoration-4 underline-offset-8">نتائج الفصل: {data.classroom?.name}</h1>
            <p className="mt-2 font-bold">العام الدراسي: {data.classroom?.academicYear?.name}</p>
          </div>

          {/* الإحصائيات في الأعلى */}
          <div className="mb-6 border-2 border-black p-2 bg-gray-100 print:bg-gray-200">
            <div className="grid grid-cols-6 gap-2 text-center text-sm font-bold">
              <div className="border-l border-gray-400 pl-2">عدد المسجلين: {data.stats.totalRegistered}</div>
              <div className="border-l border-gray-400 pl-2">عدد المشاركين: {data.stats.participantsCount}</div>
              <div className="border-l border-gray-400 pl-2 text-red-600">الغائبون: {data.stats.absenteesCount}</div>
              <div className="border-l border-gray-400 pl-2 text-green-700">الناجحون: {data.results.filter((s:any) => s.isPassing).length}</div>
              <div className="border-l border-gray-400 pl-2 text-red-600">الراسبون: {data.results.filter((s:any) => !s.isPassing).length}</div>
              <div>نسبة النجاح: {data.stats.participantsCount > 0 ? ((data.results.filter((s:any) => s.isPassing).length / data.stats.participantsCount) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>

          {/* جدول الترتيب */}
          <table className="w-full border-collapse border-2 border-black text-center">
            <thead>
              <tr className="bg-gray-200 print:bg-gray-100 text-black font-black text-lg border-b-2 border-black">
                <th className="border-r border-black p-3 w-32">رقم التسلسل</th>
                <th className="border-r border-black p-3 w-24">رقم الجلوس</th>
                <th className="border-r border-black p-3 text-right">الاسم واللقب</th>
                <th className="border-r border-black p-3 w-32">المجموع</th>
                <th className="border-r border-black p-3 w-32">المعدل / 20</th>
                <th className="border-r border-black p-3 w-24">الرتبة</th>
                <th className="border-r border-black p-3 w-32">النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((student: any) => (
                <tr key={student.studentId} className="border-b border-black hover:bg-gray-50 print:hover:bg-transparent">
                  <td className="border-r border-black p-2 font-mono font-bold">{student.studentId}</td>
                  <td className="border-r border-black p-2 font-mono">{student.seatNumber}</td>
                  <td className="border-r border-black p-2 text-right font-bold text-lg px-4">{student.studentName}</td>
                  <td className="border-r border-black p-2">{student.hasMarks ? student.totalScore : '-'}</td>
                  <td className="border-r border-black p-2 font-bold text-lg">{student.hasMarks ? Number(student.average).toFixed(2) : '-'}</td>
                  
                  <td className={`border-r border-black p-2 font-black text-xl ${student.rank <= 3 ? 'text-blue-800' : ''}`}>
                    {student.hasMarks ? student.rank : '-'}
                  </td>
                  
                  <td className={`border-r border-black p-2 font-bold ${!student.hasMarks ? 'text-gray-500' : student.isPassing ? 'text-green-700' : 'text-red-600'}`}>
                    {!student.hasMarks ? 'غائب' : (student.isPassing ? 'ناجح' : 'راسب')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-16 flex justify-between px-10">
            <p className="font-bold underline">توقيع المراقب</p>
            <p className="font-bold underline">توقيع المدير والختم</p>
          </div>

        </div>
      )}
    </div>
  );
}