package it.iumtweb.springserver.Players;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PlayersRepository extends JpaRepository<Players, Long>{
    List<Players> findPlayersByCurrentClubIdAndLastSeason(Long currentClubId, Integer lastSeason);

    List<Players> findByCurrentClubDomesticCompetitionId(String competitionId);

}
