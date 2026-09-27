import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { PlansList } from '../components/PlansList';
import { AddPlanForm } from '../components/AddPlanForm';
import { EditPlanModal } from '../components/EditPlanModal';
import { DeletePlanModal } from '../components/DeletePlanModal';
import { PlanReport } from '../components/PlanReport';
import { useNavigate } from 'react-router-dom';

interface OperatorDashboardProps {
  username: string;
  activeTab:
    | 'PLANS'
    | 'ADD_PLAN'
    | 'EDIT_PLAN'
    | 'DELETE_PLAN'
    | 'REPORT';
  onSelectTab: (
    tab: 'PLANS' | 'ADD_PLAN' | 'EDIT_PLAN' | 'DELETE_PLAN' | 'REPORT'
  ) => void;
  onLogout: () => void;
  onHomeClick: () => void;
}

export const OperatorDashboardPage: React.FC<OperatorDashboardProps> = ({
  username,
  activeTab,
  onSelectTab,
  onLogout,
  onHomeClick,
}) => {
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div>
      <Header
        username={username}
        onOpenChangePassword={() => setShowChangePassword(true)}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
      />

      {/* Navigation Tab Bar */}
      <div className="bg-light p-2 d-flex align-items-center gap-1 border-bottom">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary fw-bold me-2"
          onClick={() => navigate('/')}
          title="Back to main page"
        >
          <i className="bi bi-arrow-left me-1"></i>
          BACK
        </button>

        <button
          className={`nav-tab-btn ${
            activeTab === 'PLANS' ? 'active' : ''
          }`}
          onClick={() => onSelectTab('PLANS')}
        >
          PLANS
        </button>

        <button
          className={`nav-tab-btn ${
            activeTab === 'PLANS' ? 'active' : ''
          }`}
          onClick={() => onSelectTab('PLANS')}
        >
          PLANS
        </button>

        <button
          className={`nav-tab-btn ${
            activeTab === 'ADD_PLAN' ? 'active' : ''
          }`}
          onClick={() => onSelectTab('ADD_PLAN')}
        >
          ADD PLAN
        </button>

        <button
          className={`nav-tab-btn ${
            activeTab === 'EDIT_PLAN' ? 'active' : ''
          }`}
          onClick={() => onSelectTab('EDIT_PLAN')}
        >
          EDIT PLAN
        </button>

        <button
          className={`nav-tab-btn ${
            activeTab === 'DELETE_PLAN' ? 'active' : ''
          }`}
          onClick={() => onSelectTab('DELETE_PLAN')}
        >
          DEACTIVATE PLAN
        </button>

        <button
          className={`nav-tab-btn ${
            activeTab === 'REPORT' ? 'active' : ''
          }`}
          onClick={() => onSelectTab('REPORT')}
        >
          REPORT
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="container mt-4">

        {activeTab === 'PLANS' && <PlansList />}

        {activeTab === 'ADD_PLAN' && (
          <AddPlanForm
            onSuccess={() => onSelectTab('PLANS')}
            onCancel={() => onSelectTab('PLANS')}
          />
        )}

        {activeTab === 'EDIT_PLAN' && (
          <EditPlanModal
            onPlanUpdated={() => onSelectTab('PLANS')}
          />
        )}

        {activeTab === 'DELETE_PLAN' && (
          <DeletePlanModal
            onPlanDeactivated={() => onSelectTab('PLANS')}
          />
        )}

        {activeTab === 'REPORT' && <PlanReport />}
      </div>

      {/* Change Password */}
      {showChangePassword && (
        <ChangePasswordModal
          username={username}
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setShowChangePassword(false);
            onLogout();
          }}
        />
      )}
    </div>
  );
};
