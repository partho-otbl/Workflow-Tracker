package com.workflow.backend.dto;

import java.time.LocalDateTime;

public record DiagramDTO(
    Long id,
    String name,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
