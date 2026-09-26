package com.billing.usagebilling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.billing.usagebilling.entity.Plan;

public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findByPlanState(String planState);
}