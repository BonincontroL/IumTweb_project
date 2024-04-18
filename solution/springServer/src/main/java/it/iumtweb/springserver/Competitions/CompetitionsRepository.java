package it.iumtweb.springserver.Competitions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionsRepository extends JpaRepository<Competitions, String> {
    List<Competitions> findByNameContainingIgnoreCase(String name);
    @Query("SELECT name from Competitions where competitionId =:competitionId")
    String getName(String competitionId);
}
