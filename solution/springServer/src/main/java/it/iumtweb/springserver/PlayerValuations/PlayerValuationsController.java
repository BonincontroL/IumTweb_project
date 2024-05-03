package it.iumtweb.springserver.PlayerValuations;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/player_valuations")
public class PlayerValuationsController {

    private final PlayerValuationsService playerValuationsService;
    @Autowired
    public PlayerValuationsController(PlayerValuationsService playerValuationsService) {
        this.playerValuationsService = playerValuationsService;
    }

    @GetMapping("/getMarketValuePerYear/{playerId}")
    public ResponseEntity<?> getAverageMarketValuePerYear(@PathVariable Long playerId) {
        try {
            List<Object[]> averageMarketValues = playerValuationsService.findAverageMarketValuePerYear(playerId);
            if (averageMarketValues.isEmpty()) {
                System.out.println("No valuations found for the player with ID: " + playerId);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok().body(averageMarketValues);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error occurred");
        }
    }

}
