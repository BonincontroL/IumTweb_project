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

    public List<Competitions> getAllCompetitions() {
        return competitionsRepository.findAll();
    }

    public Optional<Competitions> getById(String competitionId) {
        return competitionsRepository.findById(competitionId);
    }

    public Map<String, List<Competitions>> getCompetitionsGroupedByCountry() {
        List<Competitions> allComps = competitionsRepository.findAll();
        return  allComps.stream()
                .collect(Collectors.groupingBy(competition-> competition.getCountryName()!=null ? competition.getCountryName(): "Internazionale"));
    }

    public Map<String,List<Competitions>> getCompetitionsGroupedByCountryAndLikeName(String name){
        List<Competitions> result= competitionsRepository.findByNameContainingIgnoreCase(name);
        return  result.stream()
                .collect(Collectors.groupingBy(competition-> competition.getCountryName()!=null ? competition.getCountryName(): "Internazionale"));
    }
}
