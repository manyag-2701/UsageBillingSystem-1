package com.billing.usagebilling.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(name = "data_allowance_gb", nullable = false)
    private Double dataAllowanceGb;

    @Column(name = "monthly_charge_usd", nullable = false)
    private Double monthlyChargeUsd;

    @Column(name = "charges_after_limit_per_mb", nullable = false)
    private Double chargesAfterLimitPerMb;

    @Column(name = "plan_state")
    private String planState;

    public Plan() {
    }

    public Plan(
            String packageName,
            Double dataAllowanceGb,
            Double monthlyChargeUsd,
            Double chargesAfterLimitPerMb,
            String planState
    ) {
        this.packageName = packageName;
        this.dataAllowanceGb = dataAllowanceGb;
        this.monthlyChargeUsd = monthlyChargeUsd;
        this.chargesAfterLimitPerMb = chargesAfterLimitPerMb;
        this.planState = planState;
    }

    public Long getId() {
        return id;
    }

    public String getPackageName() {
        return packageName;
    }

    public Double getDataAllowanceGb() {
        return dataAllowanceGb;
    }

    public Double getMonthlyChargeUsd() {
        return monthlyChargeUsd;
    }

    public Double getChargesAfterLimitPerMb() {
        return chargesAfterLimitPerMb;
    }

    public String getPlanState() {
        return planState;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public void setDataAllowanceGb(Double dataAllowanceGb) {
        this.dataAllowanceGb = dataAllowanceGb;
    }

    public void setMonthlyChargeUsd(Double monthlyChargeUsd) {
        this.monthlyChargeUsd = monthlyChargeUsd;
    }

    public void setChargesAfterLimitPerMb(Double chargesAfterLimitPerMb) {
        this.chargesAfterLimitPerMb = chargesAfterLimitPerMb;
    }

    public void setPlanState(String planState) {
        this.planState = planState;
    }
}