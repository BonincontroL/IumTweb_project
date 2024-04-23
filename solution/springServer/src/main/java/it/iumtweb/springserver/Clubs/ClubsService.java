package it.iumtweb.springserver.Clubs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;

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
        return clubsRepository.findByDomesticCompetitionIdAndLastSeason(competitionId, season);
    }

    public Optional<Clubs> findById(Long clubId) {
        return clubsRepository.findById(clubId);
    }

    public Map<Character, List<Clubs>> getClubsGroupedByInitial() {
        List<Clubs> clubs = clubsRepository.findAll();
        return clubs.stream().collect(Collectors.groupingBy(club -> Character.toUpperCase(club.getName().charAt(0))));
    }

    public Map<Character, List<Clubs>> getClubsGroupedByInitialAndLikeName(String nameSubstr) {
        List<Clubs> filteredClubs = clubsRepository.findAll().stream()
                .filter(club -> club.getName().toLowerCase().contains(nameSubstr.toLowerCase()))
                .collect(Collectors.toList());

        return filteredClubs.stream()
                .collect(Collectors.groupingBy(club -> Character.toUpperCase(club.getName().charAt(0))));
    }

    public String getLastSeason(Long clubId) {
        return clubsRepository.getLastSeason(clubId);
    }
}