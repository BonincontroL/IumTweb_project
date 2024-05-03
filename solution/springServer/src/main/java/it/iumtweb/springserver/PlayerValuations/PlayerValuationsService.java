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
     * Retrieves the average market value per year for a player.
     * @param playerId The ID of the player.
     * @return A list of arrays containing the average market value per year.
     */
    public List<Object[]> findAverageMarketValuePerYear(Long playerId) {
        return playerValuationsRepository.findAverageMarketValuePerYear(playerId);
    }
}
