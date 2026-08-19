package com.smarttransport.controller;

import com.smarttransport.dto.LocationRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketLocationController {

    // Drivers will send messages to /app/location
    // That gets broadcasted to anyone subscribed to /topic/trip/{tripId}
    @MessageMapping("/location")
    @SendTo("/topic/trip")
    public LocationRequest broadcastLocation(@Payload LocationRequest locationRequest) {
        // Technically, this just broadcasts to all subscribers of /topic/trip.
        // The frontend will filter, or we can use dynamic routing, but for this
        // portfolio project,
        // broadcasting the object containing the tripId and coordinates is highly
        // effective.
        return locationRequest;
    }
}
