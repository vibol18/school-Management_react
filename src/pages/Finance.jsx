import React, { useState } from 'react';

function Finance() {
  // Mock ledger transactions data mapping
  const [invoices, setInvoices] = useState([
    { id: 1, studentName: "Sok Menglong", studentId: "STU-2026-001", course: "Grade 9-B", amountDue: 450.00, amountPaid: 450.00, status: "Paid", dueDate: "2026-06-01", method: "ABA Pay" },
    { id: 2, studentName: "Chan Bopha", studentId: "STU-2026-002", course: "Grade 9-B", amountDue: 600.00, amountPaid: 200.00, status: "Partial", dueDate: "2026-06-05", method: "Cash" },
    { id: 3, studentName: "Keo Rotha", studentId: "STU-2026-003", course: "Grade 9-B", amountDue: 450.00, amountPaid: 0.00, status: "Unpaid", dueDate: "2026-05-20", method: "None" },
    { id: 4, studentName: "Nguon Visal", studentId: "STU-2026-004", course: "Grade 10-A", amountDue: 750.00, amountPaid: 750.00, status: "Paid", dueDate: "2026-06-01", method: "Bank Transfer" },
    { id: 5, studentName: "Phon Kalyan", studentId: "STU-2026-005", course: "Grade 10-A", amountDue: 750.00, amountPaid: 0.00, status: "Overdue", dueDate: "2026-05-15", method: "None" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: null,
    studentName: "",
    collectAmount: 0,
    method: "ABA Pay"
  });

  // Calculate high-level financial parameters
  const totalRevenue = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, curr) => acc + (curr.amountDue - curr.amountPaid), 0);
  const collectionRate = ((totalRevenue / (totalRevenue + totalOutstanding)) * 100).toFixed(1);

  const openPaymentModal = (invoice) => {
    setPaymentForm({
      invoiceId: invoice.id,
      studentName: invoice.studentName,
      collectAmount: invoice.amountDue - invoice.amountPaid,
      method: "ABA Pay"
    });
    setIsOpen(true);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setInvoices(prev => prev.map(inv => {
      if (inv.id === paymentForm.invoiceId) {
        const newPaid = inv.amountPaid + Number(paymentForm.collectAmount);
        let newStatus = "Partial";
        if (newPaid >= inv.amountDue) newStatus = "Paid";
        return { ...inv, amountPaid: newPaid, status: newStatus, method: paymentForm.method };
      }
      return inv;
    }));
    setIsOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.studentId.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case "Paid": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Partial": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Unpaid": return "bg-slate-100 text-slate-600 border-slate-200";
      case "Overdue": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER NAVIGATION CONTROL BAR ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0f1e3c] tracking-tight">Financial Ledger</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track student balance streams, tuition collections, and accounting statuses</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl w-48 focus:outline-none focus:border-blue-500 shadow-xs"
            />

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer">
                <option value="All">All Invoices</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── FINANCIAL INSIGHT METRICS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Collected Net Revenue</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Outstanding Receivables</p>
            <h3 className="text-xl font-black text-red-500 mt-1">${totalOutstanding.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Collection Efficiency</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{collectionRate}%</h3>
          </div>
        </div>

        {/* ── TRANSACTIONS INVOICE LEDGER TABLE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student Payer</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Program</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Billing</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remittance Method</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deadline Due</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredInvoices.map((inv) => {
                  const balance = inv.amountDue - inv.amountPaid;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition duration-150">
                      
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{inv.studentName}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{inv.studentId}</p>
                      </td>

                      <td className="p-4 text-slate-600 font-semibold">{inv.course}</td>

                      <td className="p-4 text-slate-800 font-mono font-bold">${inv.amountDue.toFixed(2)}</td>
                      
                      <td className="p-4 text-emerald-600 font-mono font-bold">${inv.amountPaid.toFixed(2)}</td>

                      <td className="p-4">
                        <span className="text-[11px] bg-slate-50 border border-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {inv.method}
                        </span>
                      </td>

                      <td className="p-4 text-slate-500 font-mono">{inv.dueDate}</td>

                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${getStatusStyle(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {balance > 0 ? (
                          <button 
                            onClick={() => openPaymentModal(inv)}
                            className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                          >
                            Collect Fee
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Settled</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── TRANSACTION RECONCILIATION MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Process Fee Collection</h2>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Student Target</label>
                <input type="text" disabled value={paymentForm.studentName} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payment Value ($)</label>
                  <input
                    type="number" min="0.01" step="0.01" required
                    value={paymentForm.collectAmount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, collectAmount: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Gateway Route</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-2 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  >
                    <option value="ABA Pay">ABA Pay</option>
                    <option value="Wing">Wing Wallet</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">
                  Dismiss
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition shadow-xs">
                  Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Finance;