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
    @GetMapping("/getCompetitionsGroupedByCountry")
    public ResponseEntity<Map<String,List<Competitions>>> getCompetitionsGroupedByCountry(){
        Map<String, List<Competitions>> result = competitionsService.getCompetitionsGroupedByCountry();
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok().body(result);
        }
    }
    @GetMapping("/get")
    public ResponseEntity<Competitions> getById(@RequestParam(name="competition_id") String competitionId){
        Optional<Competitions> result = competitionsService.getById(competitionId);
        return result.map(competitions -> ResponseEntity.ok().body(result.get())).orElseGet(()->ResponseEntity.notFound().build());
    }

}
