package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<Map<String,List<PlayersDTO>>> getPlayersImgUrlById(@RequestParam List<Long> starting, @RequestParam(required = false) List<Long> substitutes){
        Map<String,List<PlayersDTO>> result = playersService.getPlayersImgUrlById(starting,substitutes);
        if(result.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(result);
    }
    /**
     * endpoint to get all players who are playing in a certain competition and in a certain season
     * ordered by market value
     * @param competitionId: the competition which we want to filter
     * @param lastSeason: the season we want to filter
     * @return a list of most valuable players in a certain competitition and season.
     */
    @GetMapping("/get5RandomPlayersByCompIdAndLastSeason/{competitionId}/{lastSeason}")
    public ResponseEntity<List<Players>> get5RandomPlayersByCompIdAndLastSeason(@PathVariable String competitionId, @PathVariable Integer lastSeason) {
        List<Players> players = playersService.get5RandomPlayersByCompIdAndLastSeason(competitionId,lastSeason);
        if (players.isEmpty()) {
            System.out.println("No Players found for competition ID: " + competitionId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(players);
        }
    }
    @GetMapping("/getPlayersByCompetitionAndLastSeasonSortedByValue/{competitionId}/{lastSeason}")
    public ResponseEntity<List<Players>> getPlayersByCompetitionAndLastSeasonSortedByValue(@PathVariable String competitionId,@PathVariable Integer lastSeason ){
        List<Players> players = playersService.getPlayersByCompetitionAndLastSeasonSortedByValue(competitionId,lastSeason);
        if (players.isEmpty()) {
            System.out.println("No Players found for competition ID: " + competitionId+" and lastSeason: "+lastSeason);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(players);
        }
    }
    @GetMapping("/getTop150PlayersByMarketValue")
    public ResponseEntity<List<Players>> getTop150PlayersByMarketValue() {
        List<Players> players = playersService.getTop150PlayersByMarketValue();
        if (players.isEmpty()) {
            System.out.println("No Players found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(players);
        }
    }

    @GetMapping("/findPlayersByLetterInName")
    public ResponseEntity<List<Players>> findPlayersByLetterInName(@RequestParam String letter) {
        List<Players> players = playersService.findPlayersByLetterInName(letter);
        if (players.isEmpty()) {
            System.out.println("No Players found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(players);
        }
    }
    /**
     *
     * @param player_id to find a player
     * @return an object with  player information
     */
    @GetMapping("/getPlayerById/{player_id}")
    public ResponseEntity<Players> getById(@PathVariable long player_id) {
        Optional<Players> result = playersService.findById(player_id);
        return result.map(club -> ResponseEntity.ok().body(result.get())).orElseGet(() -> ResponseEntity.noContent().build());
    }
    @GetMapping("/getAllCountryOfCitizenship")
    public ResponseEntity<List<String>> getAllCountryOfCitizenship(){
        List<String> countries = playersService.findAllCountryOfCitizenship();
        if(countries.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(countries);
    }

    @GetMapping("/getAllDomesticCompetitions")
    public ResponseEntity<List<PlayerDomesticCompetitionDTO>> getAllDomesticCompetitionIdsAndName(){
        List<PlayerDomesticCompetitionDTO> countries = playersService.findAllDomesticCompetitions();
        if(countries.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(countries);
    }

    @GetMapping("/getByCompIdNationalityAndRole")
    public ResponseEntity<List<Players>> getByCompIdNationalityAndRole(@RequestParam(required = false,name="competitionId") String competitionId, @RequestParam(required = false,name="nation") String nation, @RequestParam(required = false, name="specificRole") String specificRole){
        List<Players> filteredPlayers = playersService.findByCompIdNationalityAndRole(competitionId,nation,specificRole);
        if(filteredPlayers.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(filteredPlayers);
    }
    @GetMapping("/getSubPositionsGroupedByPosition")
    public ResponseEntity<Map<String,List<String>>> getSubPositionsGroupedByPosition(){
        Map<String,List<String>> subPositions = playersService.findSubPositionsGroupedByPosition();
        if(subPositions.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(subPositions);
    }

}
