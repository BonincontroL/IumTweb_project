package it.iumtweb.springserver.Competitions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompetitionsRepository extends JpaRepository<Competitions, String> {

}
