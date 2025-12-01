'use client';

import { useState } from 'react';
import api from '../../lib/api';
import { Banknote, Search, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function FinancePage() {
  const [uniqueId, setUniqueId] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 1. البحث عن الطالب
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStudent(null);
    try {
      // طلب البحث الذي برمجناه في الخلفية
      const res = await api.get(`/students/search?uniqueId=${uniqueId}`);
      if (res.data) {
        setStudent(res.data);
      } else {
        alert('لم يتم العثور على طالب بهذا الرقم');
      }
    } catch (err) {
      alert('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  // 2. تنفيذ الدفع
  const handlePay = async () => {
    if (!student || !student.enrollments[0]) {
      alert('هذا الطالب غير مسجل في أي فصل حالياً');
      return;
    }
    
    setPaymentLoading(true);
    try {
      await api.post('/finance/payments', {
        enrollmentId: Number(student.enrollments[0].id), // رقم تسجيل الطالب
        amount: Number(amount),
        feeTypeId: 1 // (رسوم تسجيل - افتراضياً)
      });
      
      alert(`تم استلام مبلغ ${amount} بنجاح للطالب ${student.fullName} ✅`);
      
      // تنظيف الشاشة لعملية جديدة
      setAmount('');
      setStudent(null);
      setUniqueId('');
    } catch (err) {
      alert('فشل عملية الدفع. تأكد من الصلاحيات.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <h1 className="mb-8 text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Banknote /> الإدارة المالية (الصندوق)
      </h1>

      <div className="max-w-2xl mx-auto">
        
        {/* صندوق البحث */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
          <h3 className="text-lg font-bold text-blue-800 mb-4">بحث عن طالب</h3>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input 
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none" 
                placeholder="أدخل رقم التسلسل (مثال: 1012)"
                value={uniqueId}
                onChange={e => setUniqueId(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center min-w-[100px]">
              {loading ? <Loader2 className="animate-spin"/> : <Search />}
            </button>
          </form>
        </div>

        {/* بطاقة الطالب (تظهر فقط بعد البحث الناجح) */}
        {student && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 animate-fade-in">
            
            {/* معلومات الطالب */}
            <div className="flex items-start gap-4 mb-6 bg-green-50 p-4 rounded-lg">
              <div className="bg-green-200 p-3 rounded-full">
                <User size={32} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{student.fullName}</h2>
                <p className="text-gray-600 mt-1">رقم التسلسل: <span className="font-mono font-bold">{student.uniqueId}</span></p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="bg-white px-2 py-1 rounded border">
                    الفصل: {student.enrollments[0]?.classroom?.name || 'غير مسجل'}
                  </span>
                  <span className="bg-white px-2 py-1 rounded border">
                    الحالة: {student.enrollments[0]?.financialStatus === 'FULL' ? 'رسوم كاملة' : 'منحة'}
                  </span>
                </div>
              </div>
            </div>

            {/* نموذج الدفع */}
            {student.enrollments.length > 0 ? (
              <div className="grid gap-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">المبلغ المراد دفعه</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full border-2 border-gray-300 p-4 rounded-lg text-2xl font-bold text-green-700 focus:border-green-500 focus:outline-none" 
                      placeholder="0"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                    <span className="absolute left-4 top-5 text-gray-400 font-bold">CFA</span>
                  </div>
                </div>
                
                <button 
                  onClick={handlePay} 
                  disabled={paymentLoading || !amount}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 flex justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? <Loader2 className="animate-spin"/> : <><CheckCircle /> تأكيد استلام المبلغ</>}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded">
                <AlertCircle />
                <span>لا يمكن الدفع: الطالب غير مسجل في أي فصل لهذه السنة.</span>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}