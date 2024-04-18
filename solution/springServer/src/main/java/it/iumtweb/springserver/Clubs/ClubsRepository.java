package it.iumtweb.springserver.Clubs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubsRepository extends JpaRepository<Clubs, Long> {
    List<Clubs> findByDomesticCompetitionIdAndLastSeason(String domesticCompetitionId, String lastSeason);

    @Query("select lastSeason from Clubs where clubId=:clubId")
    String getLastSeason(Long clubId);
}
