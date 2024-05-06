package it.iumtweb.springserver.Clubs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubsRepository extends JpaRepository<Clubs, Long> {

    /**
     * Finds all clubs associated with a domestic competition and orders them by the last season's name.
     * @param domesticCompetitionId The ID of the domestic competition
     * @param lastSeason            The last season
     * @return                      The list of found clubs ordered by the last season's name
     */
    List<Clubs> findByDomesticCompetitionIdAndLastSeasonOrderByName(String domesticCompetitionId, String lastSeason);


    /**
     * Retrieves the last season of a club given its ID.
     * @param clubId The ID of the club
     * @return       The last season of the club
     */
    @Query("select lastSeason from Clubs where clubId=:clubId")
    String getLastSeason(Long clubId);
}
