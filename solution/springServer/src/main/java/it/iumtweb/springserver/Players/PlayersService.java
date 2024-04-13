package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class PlayersService {

    private final PlayersRepository playersRepository;

    @Autowired
    public PlayersService(PlayersRepository playersRepository) {
        this.playersRepository = playersRepository;
    }

    public List<Players> getAllPlayers() {
        return playersRepository.findAll();
    }

    public List<Players> searchByClubIdAndSeason(Long clubId, Integer season) {
        return playersRepository.findPlayersByCurrentClubIdAndLastSeason(clubId,season);

    }

    public List<Players> getPlayersByCurrentClubDomesticCompetitionId(String competitionId) {
        return playersRepository.findByCurrentClubDomesticCompetitionId(competitionId);
    }

    public List<Players> getPlayersByCurrentClubDomesticCompetitionIdOrderByLastSeasonDesc(String competitionId) {
        return playersRepository.findByCurrentClubDomesticCompetitionIdOrderByLastSeasonDesc(competitionId);
    }

}
