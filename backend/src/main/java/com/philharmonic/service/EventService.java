package com.philharmonic.service;

import com.philharmonic.entity.Event;
import com.philharmonic.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository repository;

    public List<Event> getAllEvents() {
        return repository.findAll();
    }

    public Event getEventById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<Event> searchEvents(String keyword) {
        return repository.findByTitleContainingIgnoreCase(keyword);
    }

    public Event createEvent(Event event) {
        return repository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Event event = getEventById(id);
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setDate(eventDetails.getDate());
        event.setPrice(eventDetails.getPrice());
        event.setAvailableTickets(eventDetails.getAvailableTickets());
        event.setImageUrl(eventDetails.getImageUrl());
        return repository.save(event);
    }

    public void deleteEvent(Long id) {
        repository.deleteById(id);
    }
}