package it.iumtweb.springserver.PlayerValuations;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlayerValuationsRepository extends JpaRepository<PlayerValuations, Long> {

    /**
     * Retrieves the average market value per year for a specific player.
     * @param playerId The ID of the player
     * @return A list of arrays containing the valuation year and the corresponding average market value,
     *         ordered by the valuation year.
     */
    @Query(value = "SELECT EXTRACT(YEAR FROM pv.datetime) AS valuationYear, AVG(pv.market_value_in_eur) AS averageMarketValue " +
            "FROM player_valuations pv " +
            "WHERE pv.player_id = :playerId " +
            "GROUP BY EXTRACT(YEAR FROM pv.datetime) " +
            "ORDER BY EXTRACT(YEAR FROM pv.datetime)", nativeQuery = true)
    List<Object[]> findAverageMarketValuePerYear(@Param("playerId") Long playerId);

}

