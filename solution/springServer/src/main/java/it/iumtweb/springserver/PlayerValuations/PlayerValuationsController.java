package it.iumtweb.springserver.PlayerValuations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/playerValuations")
public class PlayerValuationsController {

    private final PlayerValuationsService playerValuationsService;
    @Autowired
    public PlayerValuationsController(PlayerValuationsService playerValuationsService) {
        this.playerValuationsService = playerValuationsService;
    }

    /**
     * Get all player valuations
     * @return List of all player valuations
     */
    @GetMapping("/getAllPlayerValutations")
    public ResponseEntity<List<PlayerValuations>> getAllPlayerValuations() {
        List<PlayerValuations> allPlayerValuations = playerValuationsService.getAllPlayerValuations();
        if (allPlayerValuations.isEmpty()) {
            System.out.println("No PlayerValutations found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(allPlayerValuations);
        }
    }

}
