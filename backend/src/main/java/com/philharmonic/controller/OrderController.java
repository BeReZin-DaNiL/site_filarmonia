package com.philharmonic.controller;

import com.philharmonic.dto.OrderRequest;
import com.philharmonic.entity.Order;
import com.philharmonic.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(service.createOrder(request));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getUserOrders() {
        return ResponseEntity.ok(service.getUserOrders());
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }
}