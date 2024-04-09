package it.iumtweb.springserver.Clubs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public List<Clubs> findByCompetitionAndSeason(String competitionId, String season) {
        return clubsRepository.findByDomesticCompetitionIdAndLastSeason(competitionId,season);
    }

    public Optional<Clubs> findById(Long clubId) {
        return clubsRepository.findById(clubId);
    }
}
