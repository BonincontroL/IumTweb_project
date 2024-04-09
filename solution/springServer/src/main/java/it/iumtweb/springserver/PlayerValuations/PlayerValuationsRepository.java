package it.iumtweb.springserver.PlayerValuations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerValuationsRepository extends JpaRepository<PlayerValuations, Long> {

}
