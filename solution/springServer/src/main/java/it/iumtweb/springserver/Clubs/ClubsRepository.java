package it.iumtweb.springserver.Clubs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubsRepository extends JpaRepository<Clubs, Long> {
}
