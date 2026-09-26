import React, { useEffect, useState } from 'react';
import { Plan } from './PlansList';

export const PlanReport: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch('http://localhost:8081/api/operator/plans')
      .then(res => res.json())
      .then(data => setPlans(data.filter((p: Plan) => p.planState === 'Activated' || !p.planState)))
      .catch(console.error);
  }, []);

  return (
    <div className="text-center p-4">
      <h4 className="fw-bold mb-4 text-primary">SALES &amp; PLAN DISTRIBUTION</h4>

      <div className="row justify-content-center mb-4">
        {plans.map((p, idx) => {
          const colors = ['#0d6efd', '#198754', '#ffc107', '#0dcaf0', '#6f42c1'];
          const color = colors[idx % colors.length];
          return (
            <div key={p.id} className="col-md-3 mb-3">
              <div className="card shadow-sm border" style={{ borderTop: `4px solid ${color}` }}>
                <div className="card-body">
                  <h6 className="fw-bold">{p.packageName}</h6>
                  <p className="small mb-1 text-muted">Allowance: {p.dataAllowanceGb} GB</p>
                  <p className="fw-bold text-dark mb-0">${p.monthlyChargeUsd} / month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-center">
        <div
          className="rounded-circle border border-primary d-flex flex-column align-items-center justify-content-center shadow-sm"
          style={{ width: '260px', height: '260px', backgroundColor: '#e0f7fa' }}
        >
          <span className="fw-bold text-primary mb-1">[ Plan Share ]</span>
          <small className="text-muted">{plans.length} Active Plans</small>
        </div>
      </div>
    </div>
  );
};