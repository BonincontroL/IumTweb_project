package it.iumtweb.springserver.Competitions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
}
