package it.iumtweb.springserver.Players;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface PlayersRepository extends JpaRepository<Players, Long>, JpaSpecificationExecutor<Players> {
    /**
     * Finds all players associated with a specific current club ID and last season.
     * @param currentClubId The ID of the current club
     * @param lastSeason    The last season
     * @return              The list of players found
     */
    List<Players> findPlayersByCurrentClubIdAndLastSeason(Long currentClubId, Integer lastSeason);

    /**
     * Finds all players associated with the domestic competition of their current club.
     * @param competitionId The ID of the domestic competition
     * @return              The list of players found
     */
    List<Players> findByCurrentClubDomesticCompetitionId(String competitionId);

    /**
     * query that take in input a list of player ids and give a list of playerDTO
     * that are formed by player id and url
     * @param playerIds a list of player ids
     * @return a list of playersDTO object, that are couples formed by id and url.
     */
    @Query("select new it.iumtweb.springserver.Players.PlayersDTO(p.playerId,p.imageUrl) " +
            "from Players p " +
            "where p.playerId IN (:playerIds)")
    List<PlayersDTO> findPlayersWithImageUrlsByIds(@Param("playerIds") List<Long> playerIds);


    /**
     * Finds the top 150 players associated with the domestic competition of their current club for a given last season,
     * ordered by market value in descending order.
     *
     * @param competitionId The ID of the domestic competition
     * @param lastSeason    The last season
     * @return              The list of top 150 players found, ordered by market value in descending order
     */
    @Query(value="SELECT * FROM Players p where p.current_club_domestic_competition_id = :competitionId AND p.last_season=:lastSeason ORDER BY CASE WHEN p.market_value_in_eur IS NULL THEN 1 ELSE 0 END, p.market_value_in_eur DESC LIMIT 150", nativeQuery = true)
    List<Players> findTop150ByCurrentClubDomesticCompetitionIdAndLastSeasonOrderByMarketValueInEurDesc(String competitionId, Integer lastSeason);

    /**
     * Finds players whose first name or last name match the given search term,
     * or whose name (if first name is null) matches the search term.
     * @param searchTerm The search term to match against player names
     * @param pageable   Pagination information
     * @return           A page of players matching the search term
     */
    @Query(value="SELECT p from Players p where " +
            "(p.firstName is not NULL AND lower(p.firstName) LIKE concat(lower(:searchTerm),'%') OR lower(p.lastName) LIKE concat(lower(:searchTerm),'%'))" +
            "or (p.firstName is null and lower(p.name) like concat('%',lower(:searchTerm),'%'))")
    Page<Players> findByNameOrSurname(String searchTerm, Pageable pageable);


    /**
     * Retrieves a distinct list of citizenship countries for all players.
     * @return A list of strings containing citizenship countries, sorted in ascending order
     *         by the name of the country.
     */
    @Query(value="select distinct p.countryOfCitizenship from Players p where p.countryOfCitizenship is not null ORDER BY p.countryOfCitizenship ASC")
    List<String> findAllCountryOfCitizenship();


    /**
     * Retrieves a distinct list of domestic competitions for all players.
     * @return A list of PlayerDomesticCompetitionDTO objects containing the ID and name of each domestic competition,
     *         sorted in ascending order by the name of the competition.
     */
    @Query(value="select distinct new it.iumtweb.springserver.Players.PlayerDomesticCompetitionDTO(p.currentClubDomesticCompetitionId,c.name) from Players p JOIN Competitions c on (p.currentClubDomesticCompetitionId = c.competitionId) order by c.name asc")
    List<PlayerDomesticCompetitionDTO> findAllDomesticCompetitions();


    /**
     * Retrieves a distinct list of player positions and subpositions.
     * @return A list of arrays containing distinct player positions and subpositions,
     *         where both position and subposition are not null.
     */
    @Query(value = "select distinct p.position, p.subPosition from Players p where p.position is not null and p.subPosition is not null")
    List<Object[]> findAllPositions();
}
