package com.billing.usagebilling.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billing.usagebilling.entity.Plan;
import com.billing.usagebilling.service.PlanService;

@RestController
@RequestMapping("/api/operator")
@CrossOrigin(origins = "*")
public class OperatorController {

    private final PlanService planService;

    public OperatorController(PlanService planService) {
        this.planService = planService;
    }

    // GET /api/operator/plans
    @GetMapping("/plans")
    public ResponseEntity<List<Plan>> getActivePlans() {
        return ResponseEntity.ok(planService.getActivePlans());
    }

    // POST /api/operator/plans
    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return new ResponseEntity<>(
                planService.createPlan(plan),
                HttpStatus.CREATED
        );
    }

    // PUT /api/operator/plans/{id}
    @PutMapping("/plans/{id}")
    public ResponseEntity<Plan> updatePlan(
            @PathVariable Long id,
            @RequestBody Plan plan
    ) {
        return ResponseEntity.ok(
                planService.updatePlan(id, plan)
        );
    }

    // DELETE /api/operator/plans/{id}
    // This DEACTIVATES the plan rather than deleting it.
    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Map<String, String>> deactivatePlan(
            @PathVariable Long id
    ) {
        planService.deactivatePlan(id);

        return ResponseEntity.ok(
                Map.of("message", "Plan deactivated successfully")
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }
}