package it.iumtweb.springserver.Clubs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClubsService {

    private final ClubsRepository clubsRepository;

    @Autowired
    public ClubsService(ClubsRepository clubsRepository) {
        this.clubsRepository = clubsRepository;
    }

    public List<Clubs> getAllClubs() {
        return clubsRepository.findAll();
    }


}
