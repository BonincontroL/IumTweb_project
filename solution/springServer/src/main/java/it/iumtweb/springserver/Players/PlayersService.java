package it.iumtweb.springserver.Players;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlayersService {

    private final PlayersRepository playersRepository;
    private static final Integer MAX_RANDOM_PLAYERS=5;
    private static final Integer MAX_PLAYERS_FOR_RANKING=10;
    private static final Integer MAX_PLAYERS_BY_MARKET_VALUE = 150;
    private static final Integer MAX_PLAYERS_IN_SEARCH_RESULT=1000;

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
    public Map<String,List<PlayersImageDTO>> getPlayersImgUrlById(List<Long> startingIds, List<Long> substituteIds){
        List<PlayersImageDTO> startingPlayers = playersRepository.findPlayersWithImageUrlsByIds(startingIds);
        List<PlayersImageDTO> substitutePlayers= playersRepository.findPlayersWithImageUrlsByIds(substituteIds);
        Map<String, List<PlayersImageDTO>> lineup= new HashMap<>();
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
        List<Players> players = playersRepository.findTopPlayersInCompetitionAndSeason(competitionId,lastSeason, MAX_PLAYERS_BY_MARKET_VALUE); //we take the first 150 and then we shuffle randomicly
        Collections.shuffle(players); //random shuffle of the players list
        return players.subList(0,MAX_RANDOM_PLAYERS); //take the first 5.
    }

    /**
     * Retrieves the top 150 players by market value.
     * @return A list of the top 150 players by market value.
     */
    public List<Players> getTop150PlayersByMarketValue() {
        return playersRepository.findTopPlayers(MAX_PLAYERS_BY_MARKET_VALUE);
    }

    /**
     * Finds players whose name or surname contains the specified letter
     * The default limit is 1000 .
     * @param letter The letter to search for.
     * @return A list containing at most 1000 players whose name or surname contains the specified letter.
     */
    public List<Players> findPlayersByLetterInName(String letter) {
        return playersRepository.findByNameOrSurname(letter, MAX_PLAYERS_IN_SEARCH_RESULT);
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
     * Retrieves the top 10 players by competition and last season, sorted by market value.
     * @param competitionId The ID of the competition.
     * @param lastSeason The last season.
     * @return A list of 10 players from the specified competition and season, sorted by market value.
     */
    public List<Players> getPlayersByCompetitionAndLastSeasonSortedByValue(String competitionId, Integer lastSeason) {
        List<Players> players = playersRepository.findTopPlayersInCompetitionAndSeason(competitionId,lastSeason, MAX_PLAYERS_FOR_RANKING);
        return players.subList(0,Math.min(MAX_PLAYERS_FOR_RANKING,players.size())); //vogliamo una classifica quindi prendiamo i primi 10
    }
}
