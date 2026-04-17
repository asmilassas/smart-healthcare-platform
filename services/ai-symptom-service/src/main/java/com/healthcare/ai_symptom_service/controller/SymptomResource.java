package com.healthcare.ai_symptom_service.controller;

import com.healthcare.ai_symptom_service.service.SymptomService;
import com.healthcare.ai_symptom_service.service.dto.SymptomRequestDTO;
import com.healthcare.ai_symptom_service.service.dto.SymptomResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SymptomResource {

    private final SymptomService symptomService;

    public SymptomResource(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @PostMapping("/ai/symptom-check")
    public ResponseEntity<SymptomResponseDTO> checkSymptoms(@Valid @RequestBody SymptomRequestDTO request) {

        SymptomResponseDTO response = symptomService.analyzeSymptoms(request);
        return ResponseEntity.ok(response);
    }
}
