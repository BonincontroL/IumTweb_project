package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    public Map<String,List<PlayersDTO>> getPlayersImgUrlById(List<Long> startingIds, List<Long> substituteIds){
        List<PlayersDTO> startingPlayers = playersRepository.findPlayersWithImageUrlsByIds(startingIds);
        List<PlayersDTO> substitutePlayers= playersRepository.findPlayersWithImageUrlsByIds(substituteIds);
        Map<String, List<PlayersDTO>> lineup= new HashMap<>();
        lineup.put("starting_lineup", startingPlayers);
        lineup.put("substitutes", substitutePlayers);

        return lineup;
    }

    public List<Players> getPlayersByCompIdAndSeasonOrderByValue(String competitionId, Integer lastSeason) {
        return playersRepository.findTop50ByCurrentClubDomesticCompetitionIdAndLastSeasonOrderByMarketValueInEurDesc(competitionId,lastSeason);
    }

    public List<Players> getTop50PlayersByMarketValue() {
        return playersRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Players::getMarketValueInEur, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50)
                .collect(Collectors.toList());
    }
}
