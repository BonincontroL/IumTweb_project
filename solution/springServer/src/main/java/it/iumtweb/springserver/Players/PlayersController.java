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

    /**
     * endpoint to get all players who are playing in a certain club in a season
     * @param clubId the club we want to get players for
     * @param season the season we want
     * @return a list with all club players
     */
    @GetMapping("/searchByClubIdAndSeason")
    public ResponseEntity<List<Players>> searchByClubIdAndSeason(@RequestParam (name="club_id") Long clubId, @RequestParam(name="season") Integer season){
        List<Players> queryResult = playersService.searchByClubIdAndSeason(clubId,season);
        if(queryResult.isEmpty()){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.ok().body(queryResult);
        }

    }

}
