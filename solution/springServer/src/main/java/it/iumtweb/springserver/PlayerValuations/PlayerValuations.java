package it.iumtweb.springserver.PlayerValuations;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "player_valuations")
public class PlayerValuations {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "player_id")
    private Long playerId;

    @Column(name = "last_season")
    private Integer lastSeason;
    private Date datetime;
    private String date;
    private String dateweek;

    @Column(name = "market_value_in_eur")
    private Integer marketValueInEur;

    private Integer n;

    @Column(name = "current_club_id")
    private Integer currentClubId;

    @Column(name = "player_club_domestic_competition_id")
    private String playerClubDomesticCompetitionId;

    public PlayerValuations() {
    }

    public PlayerValuations(Long playerId, int lastSeason, Date datetime, String date, String dateweek, Integer marketValueInEur, Integer n, Integer currentClubId, String playerClubDomesticCompetitionId) {
        this.playerId = playerId;
        this.lastSeason = lastSeason;
        this.datetime = datetime;
        this.date = date;
        this.dateweek = dateweek;
        this.marketValueInEur = marketValueInEur;
        this.n = n;
        this.currentClubId = currentClubId;
        this.playerClubDomesticCompetitionId = playerClubDomesticCompetitionId;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public int getLastSeason() {
        return lastSeason;
    }

    public void setLastSeason(Integer lastSeason) {
        this.lastSeason = lastSeason;
    }

    public Date getDatetime() {
        return datetime;
    }

    public void setDatetime(Date datetime) {
        this.datetime = datetime;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDateweek() {
        return dateweek;
    }

    public void setDateweek(String dateweek) {
        this.dateweek = dateweek;
    }

    public Integer getMarketValueInEur() {
        return marketValueInEur;
    }

    public void setMarketValueInEur(Integer marketValueInEur) {
        this.marketValueInEur = marketValueInEur;
    }

    public Integer getN() {
        return n;
    }

    public void setN(int n) {
        this.n = n;
    }

    public Integer getCurrentClubId() {
        return currentClubId;
    }

    public void setCurrentClubId(Integer currentClubId) {
        this.currentClubId = currentClubId;
    }

    public String getPlayerClubDomesticCompetitionId() {
        return playerClubDomesticCompetitionId;
    }

    public void setPlayerClubDomesticCompetitionId(String playerClubDomesticCompetitionId) {
        this.playerClubDomesticCompetitionId = playerClubDomesticCompetitionId;
    }

    @Override
    public String toString() {
        return "PlayerValuations{" +
                "playerId=" + playerId +
                ", lastSeason=" + lastSeason +
                ", datetime=" + datetime +
                ", date=" + date +
                ", dateweek=" + dateweek +
                ", marketValueInEur=" + marketValueInEur +
                ", n=" + n +
                ", currentClubId=" + currentClubId +
                ", playerClubDomesticCompetitionId='" + playerClubDomesticCompetitionId + '\'' +
                '}';
    }


}
