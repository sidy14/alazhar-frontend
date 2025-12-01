'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Wallet, Landmark, ArrowDownCircle, UploadCloud, Loader2, FileText } from 'lucide-react';

export default function FinancialReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'DEPOSIT' | null>(null);

  const [expenseData, setExpenseData] = useState({ amount: '', reason: '', authorizedBy: '' });
  
  // بيانات الإيداع (مع الملف)
  const [depositData, setDepositData] = useState({ amount: '', bankName: '' });
  const [depositFile, setDepositFile] = useState<File | null>(null); // لتخزين الملف

  const fetchStats = async () => {
    try {
      const res = await api.get('/finance/stats/1');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', {
        branchId: 1,
        amount: Number(expenseData.amount),
        reason: expenseData.reason,
        authorizedBy: expenseData.authorizedBy
      });
      alert('تم تسجيل المصروف بنجاح');
      setExpenseData({ amount: '', reason: '', authorizedBy: '' });
      setActiveTab(null);
      fetchStats();
    } catch (err) {
      alert('فشل التسجيل');
    }
  };

  // --- (تحديث) دالة الإيداع البنكي مع الملف ---
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // إجبار المستخدم على رفع صورة
    if (!depositFile) {
      alert('يرجى إرفاق صورة وصل الإيداع (إجباري)');
      return;
    }

    try {
      // استخدام FormData لإرسال الملفات
      const formData = new FormData();
      formData.append('branchId', '1');
      formData.append('amount', depositData.amount);
      formData.append('bankName', depositData.bankName);
      formData.append('file', depositFile); // إرفاق الملف

      // نرسل الطلب مع تحديد نوع المحتوى (Axios يفعل ذلك تلقائياً مع FormData، لكن للتأكيد)
      await api.post('/finance/bank-deposits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('تم تسجيل الإيداع البنكي ورفع الوصل بنجاح ✅');
      setDepositData({ amount: '', bankName: '' });
      setDepositFile(null);
      setActiveTab(null);
      fetchStats();
    } catch (err) {
      alert('فشل التسجيل');
      console.error(err);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <h1 className="mb-8 text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Wallet /> التقارير والعمليات المالية
      </h1>

      {/* بطاقات الملخص (كما هي) */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
          <p className="text-gray-500 text-sm mb-1">إجمالي المداخيل</p>
          <h2 className="text-2xl font-bold text-green-600">{stats?.totalIncome.toLocaleString()} CFA</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-red-500">
          <p className="text-gray-500 text-sm mb-1">إجمالي المصروفات</p>
          <h2 className="text-2xl font-bold text-red-600">{stats?.totalExpense.toLocaleString()} CFA</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
          <p className="text-gray-500 text-sm mb-1">الإيداعات البنكية</p>
          <h2 className="text-2xl font-bold text-blue-600">{stats?.totalBankDeposited.toLocaleString()} CFA</h2>
        </div>
        <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">الرصيد الحالي (الكاش)</p>
          <h2 className="text-3xl font-bold">{stats?.currentCashBalance.toLocaleString()} CFA</h2>
        </div>
      </div>

      {/* أزرار العمليات */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('EXPENSE')} className="flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-lg hover:bg-red-200 transition font-bold">
          <ArrowDownCircle /> تسجيل مصروف
        </button>
        <button onClick={() => setActiveTab('DEPOSIT')} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 transition font-bold">
          <Landmark /> إيداع في البنك
        </button>
      </div>

      {/* نموذج المصروف (كما هو) */}
      {activeTab === 'EXPENSE' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 max-w-2xl">
          <h3 className="text-lg font-bold text-red-700 mb-4">تسجيل مصروف جديد</h3>
          <form onSubmit={handleExpense} className="space-y-4">
            <input required type="number" placeholder="المبلغ" className="w-full border p-2 rounded" value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} />
            <input required placeholder="السبب" className="w-full border p-2 rounded" value={expenseData.reason} onChange={e => setExpenseData({...expenseData, reason: e.target.value})} />
            <input required placeholder="بإذن من" className="w-full border p-2 rounded" value={expenseData.authorizedBy} onChange={e => setExpenseData({...expenseData, authorizedBy: e.target.value})} />
            <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">تأكيد الصرف</button>
          </form>
        </div>
      )}

      {/* --- نموذج الإيداع (المحدث مع رفع الملف) --- */}
      {activeTab === 'DEPOSIT' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 max-w-2xl">
          <h3 className="text-lg font-bold text-blue-700 mb-4">تسجيل إيداع بنكي</h3>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">المبلغ المودع</label>
              <input required type="number" className="w-full border p-2 rounded" value={depositData.amount} onChange={e => setDepositData({...depositData, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم البنك</label>
              <input required className="w-full border p-2 rounded" value={depositData.bankName} onChange={e => setDepositData({...depositData, bankName: e.target.value})} />
            </div>
            
            {/* حقل رفع الملف */}
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:bg-blue-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*,application/pdf" // يقبل صور و PDF
                required 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setDepositFile(e.target.files ? e.target.files[0] : null)}
              />
              <div className="flex flex-col items-center justify-center text-blue-500">
                {depositFile ? (
                  <>
                    <FileText size={32} />
                    <span className="mt-2 font-bold text-green-600">{depositFile.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} />
                    <span className="mt-2">اضغط هنا لرفع صورة وصل الإيداع (إجباري)</span>
                  </>
                )}
              </div>
            </div>

            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">تأكيد الإيداع ورفع الوصل</button>
          </form>
        </div>
      )}
    </div>
  );
}