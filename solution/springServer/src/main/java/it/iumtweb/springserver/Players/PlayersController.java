package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/players")
public class PlayersController {

    private final PlayersService playersService;

    @Autowired
    public PlayersController(PlayersService playersService) {
        this.playersService = playersService;
    }

    @GetMapping("/getAllPlayers")
    public ResponseEntity<List<Players>> getAllPlayers() {
        List<Players> allPlayers = playersService.getAllPlayers();
        if (allPlayers.isEmpty()) {
            System.out.println("No Players found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(allPlayers);
        }
    }

}
