package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
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


    public List<Players> getTop150PlayersByMarketValue() {
        return playersRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Players::getMarketValueInEur, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(150)
                .collect(Collectors.toList());
    }

    public List<Players> findPlayersByLetterInName(String letter) {
        return playersRepository.findByNameOrSurname(letter+'%');
    }
    public List<String> findAllCountryOfCitizenship(){ return playersRepository.findAllCountryOfCitizenship();}
    public List<PlayerDomesticCompetitionDTO> findAllDomesticCompetitions(){ return playersRepository.findAllDomesticCompetitions();}
    public Optional<Players> findById(Long playerId) {
        return playersRepository.findById(playerId);
    }
}
