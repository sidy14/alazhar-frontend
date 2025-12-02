'use client';

import { useState } from 'react';
import api from '../../lib/api';
import { Search, Printer, Loader2 } from 'lucide-react';

export default function TranscriptPage() {
  const [uniqueId, setUniqueId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const studentRes = await api.get(`/students/search?uniqueId=${uniqueId}`);
      if (!studentRes.data) {
        alert('لم يتم العثور على طالب بهذا الرقم');
        setLoading(false);
        return;
      }
      const transcriptRes = await api.get(`/students/${studentRes.data.id}/transcript`);
      setData(transcriptRes.data);
    } catch (err) {
      alert('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getAppreciation = (score: number) => {
    if (score >= 18) return 'ممتاز';
    if (score >= 16) return 'جيد جداً';
    if (score >= 14) return 'جيد';
    if (score >= 12) return 'مستحسن';
    if (score >= 10) return 'مقبول';
    return 'ضعيف';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0 font-serif" dir="rtl">
      
      <div className="max-w-[210mm] mx-auto mb-8 print:hidden">
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
          <input 
            className="flex-1 border-2 border-gray-200 p-2 rounded-lg" 
            placeholder="أدخل رقم التسلسل (مثال: 1012)"
            value={uniqueId}
            onChange={e => setUniqueId(e.target.value)}
          />
          <button type="submit" disabled={loading} className="bg-blue-800 text-white px-6 rounded-lg hover:bg-blue-900">
            {loading ? <Loader2 className="animate-spin"/> : <Search />}
          </button>
        </form>
      </div>

      {data && (
        <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-lg print:shadow-none print:w-full print:p-0 border border-gray-300 print:border-none">
          
          {/* الترويسة */}
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
            <div className="text-center">
              <h2 className="font-bold text-lg">مؤسسة الأزهر الإسلامية</h2>
              <p className="text-sm">للتربية والتعليم</p>
            </div>
            <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-400">شعار</span>
            </div>
            <div className="text-center">
              <h2 className="font-bold text-lg">Institute Islamique Al-Azhar</h2>
              <p className="text-sm">Enseignement Franco-Arabe</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black underline decoration-double underline-offset-4 mb-2">كشف الدرجات - BULLETIN DE NOTES</h1>
            <p className="font-bold text-lg">مركز: {data.student.enrollments[0]?.classroom?.branch?.nameAr}</p>
            <p>العام الدراسي: {data.student.enrollments[0]?.academicYear?.name} | الفترة: {data.transcript[0]?.term}</p>
          </div>

          <div className="border-2 border-black rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-right">
              <div className="flex"><span className="font-bold w-24">الاسم واللقب:</span> <span className="border-b border-dotted border-black flex-1">{data.student.fullName}</span></div>
              <div className="flex"><span className="font-bold w-24">تاريخ الميلاد:</span> <span className="border-b border-dotted border-black flex-1">{data.student.birthDate ? new Date(data.student.birthDate).toLocaleDateString('ar-EG') : '-'}</span></div>
              <div className="flex"><span className="font-bold w-24">رقم التسلسل:</span> <span className="border-b border-dotted border-black flex-1 font-mono">{data.student.uniqueId}</span></div>
              <div className="flex"><span className="font-bold w-24">مكان الميلاد:</span> <span className="border-b border-dotted border-black flex-1">{data.student.birthPlace}</span></div>
              <div className="flex"><span className="font-bold w-24">القسم (الصف):</span> <span className="border-b border-dotted border-black flex-1">{data.student.enrollments[0]?.classroom?.name}</span></div>
              <div className="flex"><span className="font-bold w-24">رقم الجلوس:</span> <span className="border-b border-dotted border-black flex-1">{data.student.enrollments[0]?.seatNumber}</span></div>
              <div className="flex"><span className="font-bold w-24">الجنس:</span> <span className="border-b border-dotted border-black flex-1">{data.student.gender === 'MALE' ? 'ذكر' : 'أنثى'}</span></div>
              <div className="flex"><span className="font-bold w-24">عدد التلاميذ:</span> <span className="border-b border-dotted border-black flex-1">{data.classSize}</span></div>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black text-center text-sm mb-4">
            <thead>
              <tr className="bg-gray-200 print:bg-gray-100 font-bold border-b-2 border-black">
                <th className="border-r border-black p-2 w-1/4 text-right">المواد الدراسية</th>
                <th className="border-r border-black p-2">المعامل</th>
                <th className="border-r border-black p-2">الدرجة / 20</th>
                <th className="border-r border-black p-2">المجموع</th>
                <th className="border-r border-black p-2">التقدير</th>
                <th className="border-r border-black p-2 w-1/4">ملاحظات المدرس</th>
              </tr>
            </thead>
            <tbody>
              {data.transcript.map((item: any, index: number) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 text-right font-bold">{item.subject}</td>
                  <td className="border-r border-black p-2">{item.coefficient}</td>
                  <td className="border-r border-black p-2 font-bold">{item.score}</td>
                  <td className="border-r border-black p-2">{item.total}</td>
                  <td className="border-r border-black p-2 text-xs">{item.appreciation}</td>
                  <td className="border-r border-black p-2 text-xs italic">{item.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-black font-bold">
                <td className="border-r border-black p-2 text-right">المجموع العام</td>
                <td className="border-r border-black p-2">{data.totalCoeff}</td>
                <td className="border-r border-black p-2 bg-gray-300">---</td>
                <td className="border-r border-black p-2">{data.totalScore}</td>
                <td colSpan={2} className="border-r border-black p-2"></td>
              </tr>
              <tr className="border-t-2 border-black text-lg">
                <td colSpan={2} className="border-r border-black p-3 text-left pl-4 font-bold">المعــــــــدل (Moyenne):</td>
                <td colSpan={4} className="p-3 font-black text-xl text-center">
                  {Number(data.average).toFixed(2)} / 20
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-3 gap-2 text-center text-sm mb-8">
            <div className="border-2 border-black p-1">
              <p className="font-bold border-b border-black mb-1">الترتيب (Rang)</p>
              <p className="text-lg font-bold py-2">... / {data.classSize}</p>
            </div>
            <div className="border-2 border-black p-1">
              <p className="font-bold border-b border-black mb-1">التأخر</p>
              <p className="py-2">... مرات</p>
            </div>
            <div className="border-2 border-black p-1">
              <p className="font-bold border-b border-black mb-1">الغيابات</p>
              <p className="py-2">بعذر: ... | بدون: ...</p>
            </div>
          </div>

          <div className="flex justify-between mt-12 px-8">
            <div className="text-center">
              <p className="font-bold underline mb-12">توقيع ولي الأمر</p>
            </div>
            <div className="text-center">
              <p className="font-bold underline mb-12">ملاحظات المدير</p>
            </div>
            <div className="text-center">
              <p className="font-bold underline mb-12">توقيع المدير والختم</p>
            </div>
          </div>

          <div className="mt-8 text-center print:hidden">
            <button onClick={() => window.print()} className="bg-gray-900 text-white px-8 py-3 rounded hover:bg-black flex items-center justify-center gap-2 mx-auto">
              <Printer /> طباعة الشهادة
            </button>
          </div>

        </div>
      )}
    </div>
  );
}