package com.healthcare.payment_service.repository;

import com.healthcare.payment_service.domain.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findAllByAppointmentIdOrderByCreatedAtDesc(String appointmentId);
}