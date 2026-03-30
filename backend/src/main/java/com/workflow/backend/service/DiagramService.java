package com.workflow.backend.service;

import com.workflow.backend.dto.DiagramDTO;
import com.workflow.backend.dto.DiagramRequestDTO;
import com.workflow.backend.entity.Diagram;
import com.workflow.backend.entity.User;
import com.workflow.backend.exception.ResourceNotFoundException;
import com.workflow.backend.repository.DiagramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiagramService {

    private final DiagramRepository diagramRepository;

    @Autowired
    public DiagramService(DiagramRepository diagramRepository) {
        this.diagramRepository = diagramRepository;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public List<DiagramDTO> getAllDiagrams() {
        User user = getCurrentUser();
        return diagramRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DiagramDTO getDiagramById(Long id) {
        User user = getCurrentUser();
        Diagram diagram = diagramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagram not found with id: " + id));
        
        if (!diagram.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to access this diagram");
        }
        
        return convertToDTO(diagram);
    }

    public DiagramDTO saveDiagram(DiagramRequestDTO requestDTO) {
        User user = getCurrentUser();
        Diagram diagram = new Diagram(requestDTO.name(), requestDTO.content(), user);
        return convertToDTO(diagramRepository.save(diagram));
    }

    public DiagramDTO updateDiagram(Long id, DiagramRequestDTO requestDTO) {
        User user = getCurrentUser();
        Diagram diagram = diagramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagram not found with id: " + id));
        
        if (!diagram.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to update this diagram");
        }
        
        diagram.setName(requestDTO.name());
        diagram.setContent(requestDTO.content());
        
        return convertToDTO(diagramRepository.save(diagram));
    }

    public void deleteDiagram(Long id) {
        User user = getCurrentUser();
        Diagram diagram = diagramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagram not found with id: " + id));

        if (!diagram.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to delete this diagram");
        }
        
        diagramRepository.delete(diagram);
    }

    private DiagramDTO convertToDTO(Diagram diagram) {
        return new DiagramDTO(
                diagram.getId(),
                diagram.getName(),
                diagram.getContent(),
                diagram.getCreatedAt(),
                diagram.getUpdatedAt()
        );
    }
}
