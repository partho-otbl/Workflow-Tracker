package com.workflow.backend.controller;

import com.workflow.backend.dto.DiagramDTO;
import com.workflow.backend.dto.DiagramRequestDTO;
import com.workflow.backend.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagrams")
@CrossOrigin(origins = "*")
public class DiagramController {

    private final DiagramService diagramService;

    @Autowired
    public DiagramController(DiagramService diagramService) {
        this.diagramService = diagramService;
    }

    @GetMapping
    public List<DiagramDTO> getAllDiagrams() {
        return diagramService.getAllDiagrams();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagramDTO> getDiagramById(@PathVariable Long id) {
        return ResponseEntity.ok(diagramService.getDiagramById(id));
    }

    @PostMapping
    public DiagramDTO createDiagram(@RequestBody DiagramRequestDTO requestDTO) {
        return diagramService.saveDiagram(requestDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiagramDTO> updateDiagram(@PathVariable Long id, @RequestBody DiagramRequestDTO requestDTO) {
        return ResponseEntity.ok(diagramService.updateDiagram(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiagram(@PathVariable Long id) {
        diagramService.deleteDiagram(id);
        return ResponseEntity.noContent().build();
    }
}
