package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
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

    public List<Players> get5RandomPlayersByCompIdAndLastSeason(String competitionId, Integer lastSeason) {
        List<Players> players = playersRepository.findTop150ByCurrentClubDomesticCompetitionIdAndLastSeasonOrderByMarketValueInEurDesc(competitionId,lastSeason);
        Collections.shuffle(players);
        return players.subList(0,5);
    }


    public List<Players> getTop150PlayersByMarketValue() {
        return playersRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Players::getMarketValueInEur, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(150)
                .collect(Collectors.toList());
    }

    public List<Players> findPlayersByLetterInName(String letter) {
        return playersRepository.findByNameOrSurname(letter);
    }
    public List<String> findAllCountryOfCitizenship(){ return playersRepository.findAllCountryOfCitizenship();}
    public List<PlayerDomesticCompetitionDTO> findAllDomesticCompetitions(){ return playersRepository.findAllDomesticCompetitions();}
    public Optional<Players> findById(Long playerId) {
        return playersRepository.findById(playerId);
    }
    public List<Players> findByCompIdNationalityAndRole(String competitionId, String nationality, String specificRole){
        Specification<Players> filters =PlayerSpecification.buildSpecification(competitionId,nationality,specificRole);
        return playersRepository.findAll(filters);
    }
    public Map<String,List<String>> findSubPositionsGroupedByPosition(){
        List<Object[]> positionsCouple=  playersRepository.findAllPositions();
        Map<String,List<String>> result=new HashMap<>();
        for(Object[] positionCouple: positionsCouple){
            String position= (String) positionCouple[0];
            String subPosition= (String) positionCouple[1];
            result.computeIfAbsent(position,k-> new ArrayList<>()).add(subPosition);
        }
        return result;
    }
}
