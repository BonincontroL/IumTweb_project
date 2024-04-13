package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    /**
     * endpoint to get all players who are playing in a certain competition
     * @param competitionId
     * @return a list with all players playing in the competition
     */
    @GetMapping("/getPlayersByCompetition/{competitionId}")
    public ResponseEntity<List<Players>> getPlayersByCurrentClubDomesticCompetitionId(@PathVariable String competitionId) {
        List<Players> players = playersService.getPlayersByCurrentClubDomesticCompetitionId(competitionId);
        if (players.isEmpty()) {
            System.out.println("No Players found for competition ID: " + competitionId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(players);
        }
    }

    /**
     * endpoint to get image url of all players in a certain match
     * @param starting a list of player id that start a certain match
     * @param substitutes a list of player id that bench a certain match
     * @return a map with two entries
     *  the first is "starting_lineup" and contains a list of couples with id,url of all the players that start the match
     *  the second is "substitutes" and contains a list of couples with id,url of all the players that bench the match.
     */
    @GetMapping("/getPlayersImgUrlById")
    public ResponseEntity<Map<String,List<PlayersDTO>>> getPlayersImgUrlById(@RequestParam List<Long> starting, @RequestParam List<Long> substitutes){
        Map<String,List<PlayersDTO>> result = playersService.getPlayersImgUrlById(starting,substitutes);
        if(result.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(result);
    }



}
