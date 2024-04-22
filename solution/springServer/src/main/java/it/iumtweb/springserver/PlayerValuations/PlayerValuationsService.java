package it.iumtweb.springserver.PlayerValuations;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerValuationsService {

    private final PlayerValuationsRepository playerValuationsRepository;
    public PlayerValuationsService(PlayerValuationsRepository playerValuationsRepository) {
        this.playerValuationsRepository = playerValuationsRepository;
    }
    public List<PlayerValuations> getAllPlayerValuations() {
        return playerValuationsRepository.findAll();
    }

    public List<Object[]> getAverageMarketValuePerSeason(Long playerId) {
        return playerValuationsRepository.findAverageMarketValuePerYear(playerId);
    }

    public List<Object[]> findAverageMarketValuePerYear(Long playerId) {
        return playerValuationsRepository.findAverageMarketValuePerYear(playerId);
    }
}
