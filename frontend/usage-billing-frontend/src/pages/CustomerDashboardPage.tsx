import React, { useState } from 'react';

interface Props {
  username: string;
  onLogout: () => void;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Unpaid';
}

export const CustomerDashboardPage: React.FC<Props> = ({ username, onLogout }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2026-001', date: 'Sep 01, 2026', amount: '$45.20', status: 'Unpaid' },
    { id: 'INV-2026-002', date: 'Aug 01, 2026', amount: '$38.50', status: 'Paid' },
    { id: 'INV-2026-003', date: 'Jul 01, 2026', amount: '$42.00', status: 'Paid' },
  ]);

  const handlePay = (id: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold mb-0 text-warning">CUSTOMER PORTAL</h3>
          <small className="text-muted">Usage Plan & Billing Summary</small>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-warning bg-opacity-10 text-dark p-2">Customer: {username}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Plan Details Card */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold text-primary mb-3">CURRENT ACTIVE PLAN</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Plan Name:</span>
                <span className="fw-bold">Unlimited 5G Data & Voice</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Monthly Rate:</span>
                <span className="fw-bold">$49.99 / mo</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Data Used:</span>
                <span className="fw-bold text-success">34.5 GB / 100 GB</span>
              </div>
              <div className="progress mt-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-success" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold text-dark mb-3">BILLING SUMMARY</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Outstanding Amount:</span>
                <span className="fw-bold fs-4 text-danger">
                  {invoices.find(i => i.status === 'Unpaid')?.amount || '$0.00'}
                </span>
              </div>
              <p className="small text-muted mb-0">Due Date: October 1st, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 fw-bold">MY INVOICES</div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Billing Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="fw-bold">{inv.id}</td>
                  <td>{inv.date}</td>
                  <td>{inv.amount}</td>
                  <td>
                    <span className={`badge ${inv.status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {inv.status === 'Unpaid' ? (
                      <button className="btn btn-sm btn-success px-3" onClick={() => handlePay(inv.id)}>
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-muted small">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};