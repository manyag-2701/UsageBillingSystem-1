import React, { useEffect, useState } from 'react';
import { Plan } from './PlansList';

interface EditPlanModalProps {
  onPlanUpdated: () => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  onPlanUpdated,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [packageName, setPackageName] = useState('');
  const [dataInGb, setDataInGb] = useState('');
  const [monthlyChargeUsd, setMonthlyChargeUsd] = useState('');
  const [chargesAfterLimit, setChargesAfterLimit] = useState('');

  const [showConfirmation, setShowConfirmation] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);

    setPackageName(plan.packageName);
    setDataInGb(String(plan.dataAllowanceGb));
    setMonthlyChargeUsd(String(plan.monthlyChargeUsd));
    setChargesAfterLimit(
      String(plan.chargesAfterLimitPerMb)
    );

    setErrorMsg('');
    setSuccessMsg('');
  };

  const closeEditModal = () => {
    if (loading) return;

    setSelectedPlan(null);
    setShowConfirmation(false);
    setErrorMsg('');
  };

  const validate = () => {
    if (!packageName.trim()) {
      setErrorMsg('Package name is required');
      return false;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(packageName.trim())) {
      setErrorMsg(
        'Package name can contain only letters, numbers and spaces'
      );
      return false;
    }

    if (!dataInGb || !/^\d+(\.\d+)?$/.test(dataInGb)) {
      setErrorMsg('Data allowance must contain numbers only');
      return false;
    }

    if (Number(dataInGb) <= 0) {
      setErrorMsg('Data allowance must be greater than 0');
      return false;
    }

    if (
      !monthlyChargeUsd ||
      !/^\d+(\.\d+)?$/.test(monthlyChargeUsd)
    ) {
      setErrorMsg('Monthly charge must contain numbers only');
      return false;
    }

    if (
      !chargesAfterLimit ||
      !/^\d+(\.\d+)?$/.test(chargesAfterLimit)
    ) {
      setErrorMsg(
        'Charge after limit must contain numbers only'
      );
      return false;
    }

    return true;
  };

  const handleUpdateClick = () => {
    setErrorMsg('');

    if (!validate()) {
      return;
    }

    setShowConfirmation(true);
  };

  const confirmUpdate = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(
        `http://localhost:8081/api/operator/plans/${selectedPlan.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageName: packageName.trim(),
            dataAllowanceGb: Number(dataInGb),
            monthlyChargeUsd: Number(monthlyChargeUsd),
            chargesAfterLimitPerMb: Number(
              chargesAfterLimit
            ),
            planState: 'Activated',
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setShowConfirmation(false);
        setErrorMsg(
          data.message || 'Failed to update plan'
        );
        return;
      }

      setShowConfirmation(false);
      setSuccessMsg('Plan updated successfully');

      // Update local table immediately
      setPlans((previousPlans) =>
        previousPlans.map((plan) =>
          plan.id === selectedPlan.id
            ? {
                ...plan,
                packageName: packageName.trim(),
                dataAllowanceGb: Number(dataInGb),
                monthlyChargeUsd: Number(
                  monthlyChargeUsd
                ),
                chargesAfterLimitPerMb: Number(
                  chargesAfterLimit
                ),
                planState: 'Activated',
              }
            : plan
        )
      );

      setTimeout(() => {
        setSelectedPlan(null);
        setSuccessMsg('');
        onPlanUpdated();
      }, 1500);
    } catch (err) {
      console.error(err);
      setShowConfirmation(false);
      setErrorMsg('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">

      <h5 className="text-center fw-bold mb-4">
        EDIT PLAN
      </h5>

      {errorMsg && !selectedPlan && (
        <div className="alert alert-danger">
          {errorMsg}
        </div>
      )}

      {successMsg && !selectedPlan && (
        <div className="alert alert-success">
          {successMsg}
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
                    className="btn btn-sm btn-primary"
                    onClick={() => openEditModal(plan)}
                    title="Edit Plan"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* EDIT POPUP */}
      {selectedPlan && !showConfirmation && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  EDIT PLAN
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                />
              </div>

              <div className="modal-body">

                {/* {errorMsg && (
                  <div className="alert alert-danger py-1">
                    {errorMsg}
                  </div>
                )} */}

                {errorMsg && (
                  <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-info-circle-fill"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* {successMsg && (
                  <div className="alert alert-success py-1">
                    {successMsg}
                  </div>
                )} */}

                {successMsg && (
                  <div className="alert alert-success py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="mb-3 row">
                  <label className="col-5 col-form-label fw-bold">
                    PACKAGE NAME:
                  </label>

                  <div className="col-7">
                    <input
                      type="text"
                      className="form-control"
                      value={packageName}
                      onChange={(e) =>
                        setPackageName(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mb-3 row">
                  <label className="col-5 col-form-label fw-bold">
                    DATA (GB):
                  </label>

                  <div className="col-7">
                    <input
                      type="text"
                      className="form-control"
                      value={dataInGb}
                      onChange={(e) =>
                        setDataInGb(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mb-3 row">
                  <label className="col-5 col-form-label fw-bold">
                    MONTHLY CHARGE:
                  </label>

                  <div className="col-7">
                    <input
                      type="text"
                      className="form-control"
                      value={monthlyChargeUsd}
                      onChange={(e) =>
                        setMonthlyChargeUsd(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mb-3 row">
                  <label className="col-5 col-form-label fw-bold">
                    CHARGE AFTER LIMIT:
                  </label>

                  <div className="col-7">
                    <input
                      type="text"
                      className="form-control"
                      value={chargesAfterLimit}
                      onChange={(e) =>
                        setChargesAfterLimit(e.target.value)
                      }
                    />
                  </div>
                </div>

              </div>

              <div className="modal-footer justify-content-center">

                <button
                  className="btn btn-primary px-4 fw-bold"
                  onClick={handleUpdateClick}
                  disabled={loading}
                >
                  UPDATE PLAN
                </button>

                <button
                  className="btn btn-secondary px-4 fw-bold"
                  onClick={closeEditModal}
                  disabled={loading}
                >
                  CANCEL
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* UPDATE CONFIRMATION POPUP */}
      {showConfirmation && selectedPlan && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-body text-center">

                <h5 className="fw-bold">
                  ARE YOU SURE YOU WANT TO UPDATE{' '}
                  {selectedPlan.packageName}?
                </h5>

                <p className="text-muted mt-3">
                  The edited plan details will be saved.
                </p>

                <div className="d-flex justify-content-center gap-3 mt-4">

                  <button
                    className="btn btn-primary px-4"
                    onClick={confirmUpdate}
                    disabled={loading}
                  >
                    {loading ? 'UPDATING...' : 'CONFIRM'}
                  </button>

                  <button
                    className="btn btn-secondary px-4"
                    onClick={() => setShowConfirmation(false)}
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