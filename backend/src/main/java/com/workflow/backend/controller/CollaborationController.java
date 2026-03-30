package com.workflow.backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollaborationController {

    @MessageMapping("/diagram/{id}")
    @SendTo("/topic/diagram/{id}")
    public String handleDiagramUpdate(@DestinationVariable Long id, String updatePayload) {
        // Broad-casting the update payload (JSON string representing nodes/edges changes)
        return updatePayload;
    }

    @MessageMapping("/presence/{id}")
    @SendTo("/topic/presence/{id}")
    public String handlePresenceUpdate(@DestinationVariable Long id, String presencePayload) {
        // Broad-casting cursor/presence data
        return presencePayload;
    }
}
