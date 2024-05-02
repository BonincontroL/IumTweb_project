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


    /**
     * Retrieves all clubs from the database.
     * @return A list of all clubs.
     */
    public List<Clubs> getAllClubs() {
        return clubsRepository.findAll();
    }


    /**
     * Finds clubs by competition and season.
     * @param competitionId The ID of the competition.
     * @param season The season of the competition.
     * @return A list of clubs matching the given competition ID and season.
     */
    public List<Clubs> findByCompetitionAndSeason(String competitionId, String season) {
        return clubsRepository.findByDomesticCompetitionIdAndLastSeasonOrderByName(competitionId, season);
    }

    /**
     * Finds a club by its ID.
     * @param clubId The ID of the club.
     * @return An Optional containing the club if found, otherwise empty.
     */
    public Optional<Clubs> findById(Long clubId) {
        return clubsRepository.findById(clubId);
    }


    /**
     * Groups clubs by the initial character of their name.
     * @return A map where keys are initial characters and values are lists of clubs starting with that character.
     */
    public Map<Character, List<Clubs>> getClubsGroupedByInitial() {
        List<Clubs> clubs = clubsRepository.findAll();
        return clubs.stream().collect(Collectors.groupingBy(club -> Character.toUpperCase(club.getName().charAt(0))));
    }


    /**
     * Groups clubs by the initial character of their name and filters by name substring.
     * @param nameSubstr The substring to filter club names.
     * @return A map where keys are initial characters and values are lists of clubs starting with that character and containing the name substring.
     */
    public Map<Character, List<Clubs>> getClubsGroupedByInitialAndLikeName(String nameSubstr) {
        List<Clubs> filteredClubs = clubsRepository.findAll().stream()
                .filter(club -> club.getName().toLowerCase().contains(nameSubstr.toLowerCase()))
                .collect(Collectors.toList());

        return filteredClubs.stream()
                .collect(Collectors.groupingBy(club -> Character.toUpperCase(club.getName().charAt(0))));
    }


    /**
     * Retrieves the last season of a club by its ID.
     * @param clubId The ID of the club.
     * @return The last season of the club as a string.
     */
    public String getLastSeason(Long clubId) {
        return clubsRepository.getLastSeason(clubId);
    }
}