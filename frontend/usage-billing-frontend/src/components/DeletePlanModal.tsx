import React, { useEffect, useState } from 'react';
import { Plan } from './PlansList';

interface DeletePlanProps {
  onPlanDeactivated: () => void;
}

export const DeletePlanModal: React.FC<DeletePlanProps> = ({
  onPlanDeactivated,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    null
  );

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch(
        'http://localhost:8081/api/operator/plans'
      );

      if (!res.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data: Plan[] = await res.json();

      setPlans(
        data.filter(
          (plan) =>
            plan.planState === 'Activated' ||
            !plan.planState
        )
      );
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not load plans');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const confirmDeactivate = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(
        `http://localhost:8081/api/operator/plans/${selectedPlan.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.message || 'Failed to deactivate plan'
        );
        return;
      }

      setMsg(
        data.message || 'Plan deactivated successfully'
      );

      // Remove from currently displayed active plans
      setPlans((previousPlans) =>
        previousPlans.filter(
          (plan) => plan.id !== selectedPlan.id
        )
      );

      setSelectedPlan(null);

      setTimeout(() => {
        setMsg('');
        onPlanDeactivated();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        'Failed to deactivate plan'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">

      <h5 className="text-center fw-bold mb-4">
        DEACTIVATE PLAN
      </h5>

      {errorMsg && (
        <div className="alert alert-danger">
          {errorMsg}
        </div>
      )}

      {msg && (
        <div className="alert alert-success">
          {msg}
        </div>
      )}

      <table className="table table-bordered">
        <thead className="table-primary">
          <tr>
            <th>PACKAGE NAME</th>
            <th>DATA (GB)</th>
            <th>MONTHLY CHARGE (USD)</th>
            <th>CHARGE AFTER LIMIT (USD/MB)</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {plans.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">
                No active plans available
              </td>
            </tr>
          ) : (
            plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.packageName}</td>
                <td>{plan.dataAllowanceGb}</td>
                <td>{plan.monthlyChargeUsd}</td>
                <td>{plan.chargesAfterLimitPerMb}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setErrorMsg('');
                    }}
                    title="Deactivate Plan"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* DEACTIVATE CONFIRMATION POPUP */}
      {selectedPlan && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-body text-center">

                <h5 className="fw-bold">
                  ARE YOU SURE TO DEACTIVATE{' '}
                  {selectedPlan.packageName}?
                </h5>

                <p className="text-muted mt-3">
                  This plan will no longer appear in the
                  active plans list.
                </p>

                <div className="d-flex justify-content-center gap-3 mt-4">

                  <button
                    className="btn btn-primary px-4"
                    onClick={confirmDeactivate}
                    disabled={loading}
                  >
                    {loading
                      ? 'DEACTIVATING...'
                      : 'CONFIRM'}
                  </button>

                  <button
                    className="btn btn-secondary px-4"
                    onClick={() =>
                      setSelectedPlan(null)
                    }
                    disabled={loading}
                  >
                    CANCEL
                  </button>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};