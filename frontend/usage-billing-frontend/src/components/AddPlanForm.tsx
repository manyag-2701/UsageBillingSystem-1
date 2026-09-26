import React, { useState } from 'react';

interface AddPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [packageName, setPackageName] = useState('');
  const [dataInGb, setDataInGb] = useState('');
  const [monthlyChargeUsd, setMonthlyChargeUsd] = useState('');
  const [chargesAfterLimit, setChargesAfterLimit] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        'http://localhost:8081/api/operator/plans',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageName: packageName.trim(),
            dataAllowanceGb: Number(dataInGb),
            monthlyChargeUsd: Number(monthlyChargeUsd),
            chargesAfterLimitPerMb: Number(chargesAfterLimit),
            planState: 'Activated',
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.message || 'Failed to add plan'
        );
        return;
      }

      setSuccessMsg('Plan added successfully');

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to add plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-4"
      style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h5 className="text-center fw-bold mb-4">
        ENTER DETAILS TO ADD NEW PLAN
      </h5>

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

      <form onSubmit={handleSubmit}>

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
              required
            />
          </div>
        </div>

        <div className="mb-3 row">
          <label className="col-5 col-form-label fw-bold">
            DATA ALLOWANCE (GB):
          </label>

          <div className="col-7">
            <input
              type="text"
              className="form-control"
              value={dataInGb}
              onChange={(e) =>
                setDataInGb(e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="mb-3 row">
          <label className="col-5 col-form-label fw-bold">
            MONTHLY CHARGE (USD):
          </label>

          <div className="col-7">
            <input
              type="text"
              className="form-control"
              value={monthlyChargeUsd}
              onChange={(e) =>
                setMonthlyChargeUsd(e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="mb-3 row">
          <label className="col-5 col-form-label fw-bold">
            CHARGE AFTER LIMIT (USD/MB):
          </label>

          <div className="col-7">
            <input
              type="text"
              className="form-control"
              value={chargesAfterLimit}
              onChange={(e) =>
                setChargesAfterLimit(e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="text-center mt-4 d-flex justify-content-center gap-3">

          <button
            type="submit"
            className="btn btn-primary fw-bold px-4"
            disabled={loading}
          >
            {loading ? 'ADDING...' : 'ADD PLAN'}
          </button>

          <button
            type="button"
            className="btn btn-secondary fw-bold px-4"
            onClick={onCancel}
            disabled={loading}
          >
            CANCEL
          </button>

        </div>
      </form>
    </div>
  );
};