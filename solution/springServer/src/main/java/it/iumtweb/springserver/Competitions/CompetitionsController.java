package it.iumtweb.springserver.Competitions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/competitions")
public class CompetitionsController {
    private final CompetitionsService competitionsService;

    @Autowired
    public CompetitionsController(CompetitionsService competitionsService) {
        this.competitionsService = competitionsService;
    }

    @GetMapping("/getAllCompetitions")
    public ResponseEntity<List<Competitions>> getAllCompetitions() {
        List<Competitions> AllCompetitions = competitionsService.getAllCompetitions();
        if (AllCompetitions.isEmpty()) {
            System.out.println("No competitions found");
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(AllCompetitions);
        }
    }

    /**
     * get a map where each country is associated by his competitions
     * @return a hash map where each country is associated to a list of competitions
     */
    @GetMapping("/getCompetitionsGroupedByCountry")
    public ResponseEntity<Map<String,List<Competitions>>> getCompetitionsGroupedByCountry(){
        Map<String, List<Competitions>> result = competitionsService.getCompetitionsGroupedByCountry();
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(result);
        }
    }

    /**
     * return a Hash map where each country is associated by his competitions,
     * but it's filtered by competition name
     * @param name the part of competition's name we want to find
     * @return a hash map where each country is associated to a list of competitions
     */
    @GetMapping("/getCompetitionsGroupedByCountryAndLikeName")
    public ResponseEntity<Map<String,List<Competitions>>> getCompetitionsGroupedByCountryAndLikeName(@RequestParam(name="name") String name){
        Map<String,List<Competitions>> result= competitionsService.getCompetitionsGroupedByCountryAndLikeName(name);
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(result);
        }
    }

    /**
     * get a single competition by his id
     * @param competitionId:the competition_id we want to find in DB
     * @return a single competition if exists in the database, otherwise return 404 not found.
     */
    @GetMapping("/get")
    public ResponseEntity<Competitions> getById(@RequestParam(name="competition_id") String competitionId){
        Optional<Competitions> result = competitionsService.getById(competitionId);
        return result.map(competitions -> ResponseEntity.ok().body(result.get())).orElseGet(()->ResponseEntity.notFound().build());
    }

}
