import React, { useState } from 'react';

interface AddPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FieldErrors {
  packageName?: string;
  dataInGb?: string;
  monthlyChargeUsd?: string;
  chargesAfterLimit?: string;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [packageName, setPackageName] = useState('');
  const [dataInGb, setDataInGb] = useState('');
  const [monthlyChargeUsd, setMonthlyChargeUsd] = useState('');
  const [chargesAfterLimit, setChargesAfterLimit] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        setFieldErrors({
          packageName: data.message || 'Failed to add plan',
        });
        return;
      }

      setSuccessMsg('Plan added successfully');

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);

      setFieldErrors({
        packageName: 'Failed to add plan',
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ERROR DISPLAY ----------------

  const renderError = (error?: string) => {
    if (!error) return null;

    return (
      <div
        className="d-flex align-items-center text-danger ms-2 add-plan-error"
        style={{
          minWidth: '210px',
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

  // ---------------- INPUT STYLE ----------------

  const inputStyle = {
    width: '280px',
    flexShrink: 0,
  };

  // Fixed width, never wraps to a second line — used on every field label
  // so a validation message next to it can never squeeze it onto multiple lines.
  const labelStyle = {
    width: '250px',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div
      className="p-4"
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {/*
        Scoped, !important-backed rules. If any global/Bootstrap CSS in
        the host app has higher effective priority than the plain inline
        style values below, this guarantees the label still never wraps
        and the row never breaks onto a second line.
      */}
      <style>{`
        .add-plan-row {
          display: flex !important;
          align-items: center !important;
          flex-wrap: nowrap !important;
        }
        .add-plan-label {
          width: 250px !important;
          min-width: 250px !important;
          max-width: 250px !important;
          flex-shrink: 0 !important;
          white-space: nowrap !important;
          display: inline-block !important;
        }
        .add-plan-input {
          width: 280px !important;
          flex-shrink: 0 !important;
        }
        .add-plan-error {
          flex-shrink: 0 !important;
          white-space: nowrap !important;
        }
      `}</style>

      <h5 className="text-center fw-bold mb-4">
        ENTER DETAILS TO ADD NEW PLAN
      </h5>

      {successMsg && (
        <div className="alert alert-success py-2 d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill"></i>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* PACKAGE NAME */}
        <div className="mb-3 add-plan-row">
          <label className="fw-bold add-plan-label" style={labelStyle}>
            PACKAGE NAME:
          </label>

          <div
            className="d-flex align-items-center"
            style={{ flexWrap: 'nowrap' }}
          >
            <input
              type="text"
              className={`form-control add-plan-input ${
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
              required
            />

            {renderError(fieldErrors.packageName)}
          </div>
        </div>

        {/* DATA ALLOWANCE */}
        <div className="mb-3 add-plan-row">
          <label className="fw-bold add-plan-label" style={labelStyle}>
            DATA ALLOWANCE (GB):
          </label>

          <div
            className="d-flex align-items-center"
            style={{ flexWrap: 'nowrap' }}
          >
            <input
              type="text"
              className={`form-control add-plan-input ${
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
              required
            />

            {renderError(fieldErrors.dataInGb)}
          </div>
        </div>

        {/* MONTHLY CHARGE */}
        <div className="mb-3 add-plan-row">
          <label className="fw-bold add-plan-label" style={labelStyle}>
            MONTHLY CHARGE (USD):
          </label>

          <div
            className="d-flex align-items-center"
            style={{ flexWrap: 'nowrap' }}
          >
            <input
              type="text"
              className={`form-control add-plan-input ${
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
              required
            />

            {renderError(fieldErrors.monthlyChargeUsd)}
          </div>
        </div>

        {/* CHARGE AFTER LIMIT */}
        <div className="mb-3 add-plan-row">
          <label className="fw-bold add-plan-label" style={labelStyle}>
            CHARGE AFTER LIMIT (USD/MB):
          </label>

          <div
            className="d-flex align-items-center"
            style={{ flexWrap: 'nowrap' }}
          >
            <input
              type="text"
              className={`form-control add-plan-input ${
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
              required
            />

            {renderError(fieldErrors.chargesAfterLimit)}
          </div>
        </div>

        {/* BUTTONS */}
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
