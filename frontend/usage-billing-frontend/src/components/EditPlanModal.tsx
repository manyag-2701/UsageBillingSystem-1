import React, { useEffect, useState } from 'react';
import { Plan } from './PlansList';

interface EditPlanModalProps {
  onPlanUpdated: () => void;
}

interface FieldErrors {
  packageName?: string;
  dataInGb?: string;
  monthlyChargeUsd?: string;
  chargesAfterLimit?: string;
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

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  // ---------------- VALIDATION FUNCTIONS ----------------

  const validatePackageName = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return 'Package name is required';
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(trimmedValue)) {
      return 'Package name can contain only letters, numbers and spaces';
    }

    return '';
  };

  const validateNumberField = (
    value: string,
    fieldName: string,
    greaterThanZero = false
  ) => {
    if (!value) {
      return `${fieldName} is required`;
    }

    // Allows whole numbers and decimal numbers, including a mid-typed
    // trailing decimal point (e.g. "5.") so the user isn't flagged with
    // an error while still entering digits after the dot.
    // Examples: 10, 10.5, 0.25, 99.99, 5.
    if (!/^\d+(\.\d*)?$/.test(value)) {
      return `${fieldName} must contain numbers and decimal points only`;
    }

    if (greaterThanZero && Number(value) <= 0) {
      return `${fieldName} must be greater than 0`;
    }

    return '';
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);

    setPackageName(plan.packageName);
    setDataInGb(String(plan.dataAllowanceGb));
    setMonthlyChargeUsd(String(plan.monthlyChargeUsd));
    setChargesAfterLimit(
      String(plan.chargesAfterLimitPerMb)
    );

    setFieldErrors({});
    setErrorMsg('');
    setSuccessMsg('');
  };

  const closeEditModal = () => {
    if (loading) return;

    setSelectedPlan(null);
    setShowConfirmation(false);
    setFieldErrors({});
    setErrorMsg('');
  };

  // ---------------- VALIDATE ALL ----------------

  const validate = () => {
    const errors: FieldErrors = {};

    const packageError = validatePackageName(packageName);
    if (packageError) {
      errors.packageName = packageError;
    }

    const dataError = validateNumberField(
      dataInGb,
      'Data allowance',
      true
    );
    if (dataError) {
      errors.dataInGb = dataError;
    }

    const monthlyError = validateNumberField(
      monthlyChargeUsd,
      'Monthly charge'
    );
    if (monthlyError) {
      errors.monthlyChargeUsd = monthlyError;
    }

    const limitError = validateNumberField(
      chargesAfterLimit,
      'Charge after limit'
    );
    if (limitError) {
      errors.chargesAfterLimit = limitError;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
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

  // ---------------- ERROR DISPLAY ----------------

  const renderError = (error?: string) => {
    if (!error) return null;

    return (
      <div
        className="d-flex align-items-center text-danger ms-2 edit-plan-error"
        style={{
          minWidth: '200px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <i
          className="bi bi-info-circle-fill me-1"
          style={{
            fontSize: '15px',
          }}
        ></i>

        <span
          className="fw-semibold"
          style={{
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          {error}
        </span>
      </div>
    );
  };

  // ---------------- STYLES ----------------

  const inputStyle = {
    width: '220px',
    flexShrink: 0,
  };

  // Fixed width, never wraps to a second line — so a validation message
  // next to it can never squeeze the label onto multiple lines.
  const labelStyle = {
    width: '190px',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div className="p-3">

      {/*
        Scoped, !important-backed rules. If any global/Bootstrap CSS in
        the host app has higher effective priority than the plain inline
        style values below, this guarantees the label still never wraps
        and the row never breaks onto a second line.
      */}
      <style>{`
        .edit-plan-row {
          display: flex !important;
          align-items: center !important;
          flex-wrap: nowrap !important;
        }
        .edit-plan-label {
          width: 190px !important;
          min-width: 190px !important;
          max-width: 190px !important;
          flex-shrink: 0 !important;
          white-space: nowrap !important;
          display: inline-block !important;
        }
        .edit-plan-input {
          width: 220px !important;
          flex-shrink: 0 !important;
        }
        .edit-plan-error {
          flex-shrink: 0 !important;
          white-space: nowrap !important;
        }
      `}</style>

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
          <div className="modal-dialog modal-dialog-centered modal-lg">
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

                {errorMsg && (
                  <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-info-circle-fill"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* PACKAGE NAME */}
                <div className="mb-3 edit-plan-row">
                  <label className="fw-bold edit-plan-label" style={labelStyle}>
                    PACKAGE NAME:
                  </label>

                  <div
                    className="d-flex align-items-center"
                    style={{ flexWrap: 'nowrap' }}
                  >
                    <input
                      type="text"
                      className={`form-control edit-plan-input ${
                        fieldErrors.packageName ? 'border-danger' : ''
                      }`}
                      style={inputStyle}
                      value={packageName}
                      onChange={(e) => {
                        const value = e.target.value;

                        setPackageName(value);

                        const error = validatePackageName(value);

                        setFieldErrors((prev) => ({
                          ...prev,
                          packageName: error || undefined,
                        }));
                      }}
                    />

                    {renderError(fieldErrors.packageName)}
                  </div>
                </div>

                {/* DATA ALLOWANCE */}
                <div className="mb-3 edit-plan-row">
                  <label className="fw-bold edit-plan-label" style={labelStyle}>
                    DATA (GB):
                  </label>

                  <div
                    className="d-flex align-items-center"
                    style={{ flexWrap: 'nowrap' }}
                  >
                    <input
                      type="text"
                      className={`form-control edit-plan-input ${
                        fieldErrors.dataInGb ? 'border-danger' : ''
                      }`}
                      style={inputStyle}
                      value={dataInGb}
                      onChange={(e) => {
                        const value = e.target.value;

                        setDataInGb(value);

                        const error = validateNumberField(
                          value,
                          'Data allowance',
                          true
                        );

                        setFieldErrors((prev) => ({
                          ...prev,
                          dataInGb: error || undefined,
                        }));
                      }}
                    />

                    {renderError(fieldErrors.dataInGb)}
                  </div>
                </div>

                {/* MONTHLY CHARGE */}
                <div className="mb-3 edit-plan-row">
                  <label className="fw-bold edit-plan-label" style={labelStyle}>
                    MONTHLY CHARGE:
                  </label>

                  <div
                    className="d-flex align-items-center"
                    style={{ flexWrap: 'nowrap' }}
                  >
                    <input
                      type="text"
                      className={`form-control edit-plan-input ${
                        fieldErrors.monthlyChargeUsd ? 'border-danger' : ''
                      }`}
                      style={inputStyle}
                      value={monthlyChargeUsd}
                      onChange={(e) => {
                        const value = e.target.value;

                        setMonthlyChargeUsd(value);

                        const error = validateNumberField(
                          value,
                          'Monthly charge'
                        );

                        setFieldErrors((prev) => ({
                          ...prev,
                          monthlyChargeUsd: error || undefined,
                        }));
                      }}
                    />

                    {renderError(fieldErrors.monthlyChargeUsd)}
                  </div>
                </div>

                {/* CHARGE AFTER LIMIT */}
                <div className="mb-3 edit-plan-row">
                  <label className="fw-bold edit-plan-label" style={labelStyle}>
                    CHARGE AFTER LIMIT:
                  </label>

                  <div
                    className="d-flex align-items-center"
                    style={{ flexWrap: 'nowrap' }}
                  >
                    <input
                      type="text"
                      className={`form-control edit-plan-input ${
                        fieldErrors.chargesAfterLimit ? 'border-danger' : ''
                      }`}
                      style={inputStyle}
                      value={chargesAfterLimit}
                      onChange={(e) => {
                        const value = e.target.value;

                        setChargesAfterLimit(value);

                        const error = validateNumberField(
                          value,
                          'Charge after limit'
                        );

                        setFieldErrors((prev) => ({
                          ...prev,
                          chargesAfterLimit: error || undefined,
                        }));
                      }}
                    />

                    {renderError(fieldErrors.chargesAfterLimit)}
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
