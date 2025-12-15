package com.philharmonic.service;

import com.philharmonic.dto.OrderRequest;
import com.philharmonic.entity.Event;
import com.philharmonic.entity.Order;
import com.philharmonic.entity.User;
import com.philharmonic.repository.EventRepository;
import com.philharmonic.repository.OrderRepository;
import com.philharmonic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order createOrder(OrderRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getAvailableTickets() < request.getTicketsCount()) {
            throw new RuntimeException("Not enough tickets available");
        }

        event.setAvailableTickets(event.getAvailableTickets() - request.getTicketsCount());
        eventRepository.save(event);

        Order order = new Order();
        order.setUser(user);
        order.setEvent(event);
        order.setTicketsCount(request.getTicketsCount());
        order.setTotalPrice(event.getPrice() * request.getTicketsCount());
        order.setOrderDate(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public List<Order> getUserOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}