import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { PlansList } from '../components/PlansList';
import { AddPlanForm } from '../components/AddPlanForm';
import { EditPlanModal } from '../components/EditPlanModal';
import { DeletePlanModal } from '../components/DeletePlanModal';
import { PlanReport } from '../components/PlanReport';

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
      <div className="bg-light p-2 d-flex gap-1 border-bottom">
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