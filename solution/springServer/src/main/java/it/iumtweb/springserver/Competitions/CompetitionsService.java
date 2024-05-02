package it.iumtweb.springserver.Competitions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompetitionsService {

    private final CompetitionsRepository competitionsRepository;

    @Autowired
    public CompetitionsService(CompetitionsRepository competitionsRepository) {
        this.competitionsRepository = competitionsRepository;
    }


    /**
     * Retrieves all competitions from the database.
     * @return A list of all competitions.
     */
    public List<Competitions> getAllCompetitions() {
        return competitionsRepository.findAll();
    }


    /**
     * Finds a competition by its ID.
     * @param competitionId The ID of the competition.
     * @return An Optional containing the competition if found, otherwise empty.
     */
    public Optional<Competitions> getById(String competitionId) {
        return competitionsRepository.findById(competitionId);
    }


    /**
     * Groups competitions by country name.
     * @return A map where keys are country names and values are lists of competitions belonging to that country.
     */
    public Map<String, List<Competitions>> getCompetitionsGroupedByCountry() {
        List<Competitions> allComps = competitionsRepository.findAll();
        return  allComps.stream()
                .collect(Collectors.groupingBy(competition-> competition.getCountryName()!=null ? competition.getCountryName(): "Internazionale"));
    }


    /**
     * Retrieves the name of a competition by its ID.
     * @param competitionId The ID of the competition.
     * @return The name of the competition.
     */
    public String getName(String competitionId){
        return competitionsRepository.getName(competitionId);
    }
}
