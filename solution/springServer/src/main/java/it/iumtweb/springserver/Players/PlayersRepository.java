package it.iumtweb.springserver.Players;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlayersRepository extends JpaRepository<Players, Long>, JpaSpecificationExecutor<Players> {
    List<Players> findPlayersByCurrentClubIdAndLastSeason(Long currentClubId, Integer lastSeason);
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

    @Query(value="SELECT * FROM Players p where p.current_club_domestic_competition_id = :competitionId AND p.last_season=:lastSeason ORDER BY CASE WHEN p.market_value_in_eur IS NULL THEN 1 ELSE 0 END, p.market_value_in_eur DESC LIMIT 150", nativeQuery = true)
    List<Players> findTop150ByCurrentClubDomesticCompetitionIdAndLastSeasonOrderByMarketValueInEurDesc(String competitionId, Integer lastSeason);

    @Query(value="SELECT p from Players p where " +
            "(p.firstName is not NULL AND lower(p.firstName) LIKE concat(lower(:searchTerm),'%') OR lower(p.lastName) LIKE concat(lower(:searchTerm),'%'))" +
            "or (p.firstName is null and lower(p.name) like concat('%',lower(:searchTerm),'%'))")
    List<Players> findByNameOrSurname(String searchTerm);

    @Query(value="select distinct p.countryOfCitizenship from Players p where p.countryOfCitizenship is not null ORDER BY p.countryOfCitizenship ASC")
    List<String> findAllCountryOfCitizenship();

    @Query(value="select distinct new it.iumtweb.springserver.Players.PlayerDomesticCompetitionDTO(p.currentClubDomesticCompetitionId,c.name) from Players p JOIN Competitions c on (p.currentClubDomesticCompetitionId = c.competitionId) order by c.name asc")
    List<PlayerDomesticCompetitionDTO> findAllDomesticCompetitions();

    @Query(value = "select distinct p.position, p.subPosition from Players p where p.position is not null and p.subPosition is not null")
    List<Object[]> findAllPositions();
}
