package org.landregistry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/land")
@CrossOrigin(origins = "*")
public class LandController {

    private final LandRegistryService landRegistryService;

    @Autowired
    public LandController(LandRegistryService landRegistryService) {
        this.landRegistryService = landRegistryService;
    }

    public record CreateLandRequest(String ulpin, String gpsCoordinates, String parentUlpin, String currentOwnerId, String documentHash) {}
    
    public record TransferRequest(String sellerId, String newOwnerId, String newDocumentHash) {}
    
    public record MutateRequest(String currentOwnerId, String child1Ulpin, String child1Gps, String child2Ulpin, String child2Gps, String newDocumentHash) {}

    @PostMapping
    public ResponseEntity<String> createLandAsset(@RequestBody CreateLandRequest request) {
        try {
            String result = landRegistryService.createLandAsset(
                    request.ulpin(), 
                    request.gpsCoordinates(), 
                    request.parentUlpin(), 
                    request.currentOwnerId(), 
                    request.documentHash()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{ulpin}")
    public ResponseEntity<String> readLandAsset(@PathVariable String ulpin) {
        try {
            String result = landRegistryService.readLandAsset(ulpin);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{ulpin}/transfer")
    public ResponseEntity<String> transferOwnership(@PathVariable String ulpin, @RequestBody TransferRequest request) {
        try {
            String result = landRegistryService.transferOwnership(
                ulpin, 
                request.sellerId(), 
                request.newOwnerId(), 
                request.newDocumentHash()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{ulpin}/mutate")
    public ResponseEntity<String> mutateLand(@PathVariable String ulpin, @RequestBody MutateRequest request) {
        try {
            String result = landRegistryService.mutateLand(
                    ulpin, 
                    request.currentOwnerId(), 
                    request.child1Ulpin(), 
                    request.child1Gps(), 
                    request.child2Ulpin(), 
                    request.child2Gps(), 
                    request.newDocumentHash()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<String> queryLandByOwner(@PathVariable String ownerId) {
        try {
            String result = landRegistryService.queryLandByOwner(ownerId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{ulpin}/history")
    public ResponseEntity<String> getLandHistory(@PathVariable String ulpin) {
        try {
            String result = landRegistryService.getLandHistory(ulpin);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}