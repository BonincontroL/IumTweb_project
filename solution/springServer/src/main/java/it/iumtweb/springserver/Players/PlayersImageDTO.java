package it.iumtweb.springserver.Players;

/**
 * this class represent a player DTO that contains playerId and imageUrl
 */
public class PlayersImageDTO {
    private Long playerId;
    private String imageUrl;

    public PlayersImageDTO(Long playerId, String url) {
        this.playerId = playerId;
        this.imageUrl = url;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
