package it.iumtweb.springserver.PlayerValuations;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerValuationsService {

    private final PlayerValuationsRepository playerValuationsRepository;
    public PlayerValuationsService(PlayerValuationsRepository playerValuationsRepository) {
        this.playerValuationsRepository = playerValuationsRepository;
    }

    /**
     * Retrieves all player valuations.
     * @return A list of all player valuations.
     */
    public List<PlayerValuations> getAllPlayerValuations() {
        return playerValuationsRepository.findAll();
    }


  /*  public List<Object[]> getAverageMarketValuePerSeason(Long playerId) {
        return playerValuationsRepository.findAverageMarketValuePerYear(playerId);
    }*/


    /**
     * Retrieves the average market value per year for a player.
     * @param playerId The ID of the player.
     * @return A list of arrays containing the average market value per year.
     */
    public List<Object[]> findAverageMarketValuePerYear(Long playerId) {
        return playerValuationsRepository.findAverageMarketValuePerYear(playerId);
    }
}
