package com.philharmonic.repository;

import com.philharmonic.entity.Order;
import com.philharmonic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
}