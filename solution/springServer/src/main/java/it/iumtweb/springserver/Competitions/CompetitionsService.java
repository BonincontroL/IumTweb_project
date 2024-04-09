package it.iumtweb.springserver.Competitions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

}
