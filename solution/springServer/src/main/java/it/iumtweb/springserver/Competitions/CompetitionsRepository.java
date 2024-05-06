package it.iumtweb.springserver.Competitions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionsRepository extends JpaRepository<Competitions, String> {

    /**
     * Retrieves the name of a competition given its ID.
     * @param competitionId The ID of the competition
     * @return              The name of the competition
     */
    @Query("SELECT name from Competitions where competitionId =:competitionId")
    String getName(String competitionId);
}
