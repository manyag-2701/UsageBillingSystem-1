package com.billing.usagebilling.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.billing.usagebilling.entity.Plan;
import com.billing.usagebilling.repository.PlanRepository;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    // View only active plans
    public List<Plan> getActivePlans() {
        return planRepository.findByPlanState("Activated");
    }

    // Add a new plan
    public Plan createPlan(Plan plan) {

        plan.setId(null);
        plan.setPlanState("Activated");

        return planRepository.save(plan);
    }

    // Edit an existing plan
    public Plan updatePlan(Long id, Plan updatedPlan) {

        Plan existingPlan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        existingPlan.setPackageName(updatedPlan.getPackageName());
        existingPlan.setDataAllowanceGb(updatedPlan.getDataAllowanceGb());
        existingPlan.setMonthlyChargeUsd(updatedPlan.getMonthlyChargeUsd());
        existingPlan.setChargesAfterLimitPerMb(
                updatedPlan.getChargesAfterLimitPerMb()
        );

        // Keep it activated when edited from the active-plan screen
        existingPlan.setPlanState("Activated");

        return planRepository.save(existingPlan);
    }

    // Deactivate a plan
    public Plan deactivatePlan(Long id) {

        Plan existingPlan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        existingPlan.setPlanState("Deactivated");

        return planRepository.save(existingPlan);
    }
}