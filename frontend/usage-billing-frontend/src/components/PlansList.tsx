import React, { useEffect, useState } from 'react';

export interface Plan {
  id: number;
  packageName: string;
  dataAllowanceGb: number;
  monthlyChargeUsd: number;
  chargesAfterLimitPerMb: number;
  planState: string;
}

export const PlansList: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8081/api/operator/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data: Plan[] = await res.json();
      // Only active plans are displayed as per specification
      const activePlans = data.filter(p => p.planState === 'Activated' || !p.planState);
      setPlans(activePlans);
    } catch (err) {
      console.error(err);
      setError('Could not load plans. Ensure backend is running on port 8081.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const totalPages = Math.ceil(plans.length / pageSize) || 1;
  const displayedPlans = plans.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="p-3">
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <table className="table table-bordered border-primary text-center align-middle">
        <thead className="table-primary">
          <tr>
            <th>Package</th>
            <th>Data in GB</th>
            <th>Monthly Charge in USD</th>
            <th>Charges after limit</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-4">Loading plans...</td>
            </tr>
          ) : displayedPlans.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-muted">No active plans found.</td>
            </tr>
          ) : (
            displayedPlans.map((plan) => (
              <tr key={plan.id}>
                <td className="fw-semibold">{plan.packageName}</td>
                <td>{plan.dataAllowanceGb}</td>
                <td>${plan.monthlyChargeUsd}</td>
                <td>${plan.chargesAfterLimitPerMb} / MB</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination: 10 plans per page */}
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <button
          className="btn btn-sm btn-secondary"
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
        >
          &lt;
        </button>
        <span className="small fw-semibold">
          Page {page + 1} of {totalPages}
        </span>
        <button
          className="btn btn-sm btn-secondary"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(p => p + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};