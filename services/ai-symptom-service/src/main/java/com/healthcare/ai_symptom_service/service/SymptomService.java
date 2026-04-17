package com.healthcare.ai_symptom_service.service;

import com.healthcare.ai_symptom_service.service.dto.SymptomResponseDTO;
import com.healthcare.ai_symptom_service.service.dto.SymptomRequestDTO;

public interface SymptomService {

    SymptomResponseDTO analyzeSymptoms(SymptomRequestDTO request);
}
