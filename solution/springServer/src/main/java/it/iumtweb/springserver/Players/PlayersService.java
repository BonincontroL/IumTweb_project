package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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


    /**
     * Retrieves all players from the database.
     * @return A list of all players.
     */
    public List<Players> getAllPlayers() {
        return playersRepository.findAll();
    }


    /**
     * Searches for players by club ID and season.
     * @param clubId The ID of the club.
     * @param season The season.
     * @return A list of players belonging to the specified club in the given season.
     */
    public List<Players> searchByClubIdAndSeason(Long clubId, Integer season) {
        return playersRepository.findPlayersByCurrentClubIdAndLastSeason(clubId,season);

    }

    /**
     * Retrieves players by current club's domestic competition ID.
     * @param competitionId The ID of the domestic competition.
     * @return A list of players belonging to clubs participating in the specified domestic competition.
     */
    public List<Players> getPlayersByCurrentClubDomesticCompetitionId(String competitionId) {
        return playersRepository.findByCurrentClubDomesticCompetitionId(competitionId);
    }

    /**
     * Retrieves image URLs of players by their IDs.
     * @param startingIds The IDs of starting players.
     * @param substituteIds The IDs of substitute players.
     * @return A map containing lists of image URLs categorized as 'starting_lineup' and 'substitutes'.
     */
    public Map<String,List<PlayersDTO>> getPlayersImgUrlById(List<Long> startingIds, List<Long> substituteIds){
        List<PlayersDTO> startingPlayers = playersRepository.findPlayersWithImageUrlsByIds(startingIds);
        List<PlayersDTO> substitutePlayers= playersRepository.findPlayersWithImageUrlsByIds(substituteIds);
        Map<String, List<PlayersDTO>> lineup= new HashMap<>();
        lineup.put("starting_lineup", startingPlayers);
        lineup.put("substitutes", substitutePlayers);

        return lineup;
    }

    /**
     * Retrieves 5 random players from a specific competition and season.
     * @param competitionId The ID of the competition.
     * @param lastSeason The last season.
     * @return A list of 5 random players from the specified competition and season.
     */
    public List<Players> get5RandomPlayersByCompIdAndLastSeason(String competitionId, Integer lastSeason) {
        List<Players> players = playersRepository.findTop150ByCurrentClubDomesticCompetitionIdAndLastSeasonOrderByMarketValueInEurDesc(competitionId,lastSeason);
        Collections.shuffle(players);
        return players.subList(0,5);
    }

    /**
     * Retrieves the top 150 players by market value.
     * @return A list of the top 150 players by market value.
     */
    public List<Players> getTop150PlayersByMarketValue() {
        return playersRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Players::getMarketValueInEur, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(150)
                .collect(Collectors.toList());
    }

    /**
     * Finds players whose name or surname contains the specified letter.
     * @param letter The letter to search for.
     * @return A list of players whose name or surname contains the specified letter.
     */
    public List<Players> findPlayersByLetterInName(String letter) {
        return playersRepository.findByNameOrSurname(letter, PageRequest.of(0,1000)).stream().toList();
    }

    /**
     * Finds all countries of citizenship represented by players.
     * @return A list of unique country names representing players' citizenship.
     */
    public List<String> findAllCountryOfCitizenship(){ return playersRepository.findAllCountryOfCitizenship();}

    /**
     * Finds all domestic competitions in which players have participated.
     * @return A list of domestic competitions.
     */
    public List<PlayerDomesticCompetitionDTO> findAllDomesticCompetitions(){ return playersRepository.findAllDomesticCompetitions();}

    /**
     * Retrieves a player by their ID.
     * @param playerId The ID of the player to retrieve.
     * @return An optional containing the player if found, otherwise empty.
     */
    public Optional<Players> findById(Long playerId) {
        return playersRepository.findById(playerId);
    }


    /**
     * Finds players by competition ID, nationality, and role.
     * @param competitionId The ID of the competition.
     * @param nationality The nationality of the players.
     * @param specificRole The specific role of the players.
     * @return A list of players matching the specified criteria.
     */
    public List<Players> findByCompIdNationalityAndRole(String competitionId, String nationality, String specificRole){
        Specification<Players> filters =PlayerSpecification.buildSpecification(competitionId,nationality,specificRole);
        return playersRepository.findAll(filters);
    }

    /**
     * Finds sub-positions grouped by position.
     * @return A map containing sub-positions grouped by position.
     */
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


    /**
     * Retrieves players by competition and last season, sorted by market value.
     * @param competitionId The ID of the competition.
     * @param lastSeason The last season.
     * @return A list of players from the specified competition and season, sorted by market value.
     */
    public List<Players> getPlayersByCompetitionAndLastSeasonSortedByValue(String competitionId, Integer lastSeason) {
        List<Players> players = playersRepository.findTop150ByCurrentClubDomesticCompetitionIdAndLastSeasonOrderByMarketValueInEurDesc(competitionId,lastSeason);
        return players.subList(0,Math.min(10,players.size())); //prendiamo i primi 10
    }
}
