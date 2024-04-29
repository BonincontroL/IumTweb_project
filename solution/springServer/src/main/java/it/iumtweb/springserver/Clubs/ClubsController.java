package it.iumtweb.springserver.Clubs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/clubs")
public class ClubsController {

    private final ClubsService clubsService;

    @Autowired
    public ClubsController(ClubsService clubsService) {
        this.clubsService = clubsService;
    }

    @GetMapping("/getAllClubs")
    public ResponseEntity<List<Clubs>> getAllClubs() {
        List<Clubs> allClubs = clubsService.getAllClubs();
        if (allClubs.isEmpty()) {
            System.out.println("No clubs found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(allClubs);
        }
    }

    /**
     * get a single club information by id
     *
     * @param clubId the club id we want information for
     * @return an empty HTTP response if we didn't find the club, otherwise return a HTTP response with the club
     */
    @GetMapping("/get")
    public ResponseEntity<Clubs> getById(@RequestParam(name = "club_id") Long clubId) {
        Optional<Clubs> result = clubsService.findById(clubId);
        return result.map(club -> ResponseEntity.ok().body(result.get())).orElseGet(() -> ResponseEntity.noContent().build());
    }

    /**
     * get all clubs that play in a single competition in a season
     *
     * @param competition_id the competition we want to filter clubs for
     * @param season         the season we want to filter clubs for
     * @return an empty HTTP response if we didn't find the clubs, otherwise return an HTTP response with a list of clubs
     */
    @GetMapping("/searchByCompetitionAndSeason")
    public ResponseEntity<List<Clubs>> searchByCompetitionAndSeason(@RequestParam(name = "competition_id") String competition_id, @RequestParam(name = "season") String season) {
        List<Clubs> result = clubsService.findByCompetitionAndSeason(competition_id, season);
        if (result.isEmpty())
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.ok().body(result);
    }

    /**
     * restituisce tutte le squadre divise per la lettera iniziale .
     * @return una hashmap dove la chiave è il carattere e il valore è la lista delle squadre che iniziano per quel carattere
     */
    @GetMapping("/getAllClubsByInitial")
    public ResponseEntity<Map<Character, List<Clubs>>> getAllClubsByInitial() {
        Map<Character, List<Clubs>> clubsMap = clubsService.getClubsGroupedByInitial();
        if (clubsMap.isEmpty()) {
            System.out.println("No clubs found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(clubsMap);
        }
    }

    @GetMapping("/getClubsGroupedByInitialAndLikeName")
    public ResponseEntity<Map<Character, List<Clubs>>> getClubsGroupedByInitialAndLikeName(@RequestParam("name") String nameSubstr) {
        Map<Character, List<Clubs>> result = clubsService.getClubsGroupedByInitialAndLikeName(nameSubstr);
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/getLastSeason")
    public ResponseEntity<Map<String,Integer>> getLastSeason(@RequestParam(name="club_id") Long clubId){
        Map<String,Integer> map = new HashMap<>();
        Integer lastSeason = Integer.parseInt(clubsService.getLastSeason(clubId));
        map.put("lastSeason",lastSeason);
        return ResponseEntity.ok().body(map);
    }

}