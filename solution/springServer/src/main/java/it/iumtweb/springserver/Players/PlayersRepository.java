package it.iumtweb.springserver.Players;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PlayersRepository extends JpaRepository<Players, Long>{
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

    List<Players> findByCurrentClubDomesticCompetitionIdOrderByLastSeasonDesc(String competitionId);

}
