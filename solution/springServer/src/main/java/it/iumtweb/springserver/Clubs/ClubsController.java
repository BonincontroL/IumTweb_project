package it.iumtweb.springserver.Clubs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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



}
