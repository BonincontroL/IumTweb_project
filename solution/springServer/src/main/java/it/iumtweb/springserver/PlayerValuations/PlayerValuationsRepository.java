package it.iumtweb.springserver.PlayerValuations;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlayerValuationsRepository extends JpaRepository<PlayerValuations, Long> {

    /**
     * si calcolano tutti gli anni e la media delle valutazione per ogni anno
     * @param playerId del player di cui si vuole le medie
     * @return una lista di array di oggetti
     */
    @Query(value = "SELECT EXTRACT(YEAR FROM pv.datetime) AS valuationYear, AVG(pv.market_value_in_eur) AS averageMarketValue " +
            "FROM player_valuations pv " +
            "WHERE pv.player_id = :playerId " +
            "GROUP BY EXTRACT(YEAR FROM pv.datetime) " +
            "ORDER BY EXTRACT(YEAR FROM pv.datetime)", nativeQuery = true)
    List<Object[]> findAverageMarketValuePerYear(@Param("playerId") Long playerId);

}

