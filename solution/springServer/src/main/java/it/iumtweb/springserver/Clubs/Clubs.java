package it.iumtweb.springserver.Clubs;

import jakarta.persistence.*;

/**
 * This class represents the Clubs entity.
 */
@Entity
@Table(name = "clubs")
public class Clubs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_id")
    private Long clubId;

    @Column(name = "club_code")
    private String clubCode;

    @Column(name = "name")
    private String name;

    @Column(name = "domestic_competition_id")
    private String domesticCompetitionId;

    @Column(name = "total_market_value")
    private Double totalMarketValue;

    @Column(name = "squad_size")
    private Integer squadSize;

    @Column(name = "average_age")
    private Double averageAge;

    @Column(name = "foreigners_number")
    private Integer foreignersNumber;

    @Column(name = "foreigners_percentage")
    private Double foreignersPercentage;

    @Column(name = "national_team_players")
    private Integer nationalTeamPlayers;

    @Column(name = "stadium_name")
    private String stadiumName;

    @Column(name = "stadium_seats")
    private Integer stadiumSeats;

    @Column(name = "net_transfer_record")
    private String netTransferRecord;

    @Column(name = "coach_name")
    private String coachName;

    @Column(name = "last_season")
    private String lastSeason;

    @Column(name = "url")
    private String url;


    public Clubs() {
        // Default constructor required by JPA
    }

    public Clubs(Long clubId, String clubCode, String name, String domesticCompetitionId, Double totalMarketValue, Integer squadSize, Double averageAge, Integer foreignersNumber, Double foreignersPercentage, Integer nationalTeamPlayers, String stadiumName, Integer stadiumSeats, String netTransferRecord, String coachName, String lastSeason, String url) {
        this.clubId = clubId;
        this.clubCode = clubCode;
        this.name = name;
        this.domesticCompetitionId = domesticCompetitionId;
        this.totalMarketValue = totalMarketValue;
        this.squadSize = squadSize;
        this.averageAge = averageAge;
        this.foreignersNumber = foreignersNumber;
        this.foreignersPercentage = foreignersPercentage;
        this.nationalTeamPlayers = nationalTeamPlayers;
        this.stadiumName = stadiumName;
        this.stadiumSeats = stadiumSeats;
        this.netTransferRecord = netTransferRecord;
        this.coachName = coachName;
        this.lastSeason = lastSeason;
        this.url = url;
    }

    public Long getClubId() {
        return clubId;
    }

    public String getClubCode() {
        return clubCode;
    }

    public String getName() {
        return name;
    }

    public String getDomesticCompetitionId() {
        return domesticCompetitionId;
    }

    public Double getTotalMarketValue() {
        return totalMarketValue;
    }

    public Integer getSquadSize() {
        return squadSize;
    }

    public Double getAverageAge() {
        return averageAge;
    }

    public Integer getForeignersNumber() {
        return foreignersNumber;
    }

    public Double getForeignersPercentage() {
        return foreignersPercentage;
    }

    public Integer getNationalTeamPlayers() {
        return nationalTeamPlayers;
    }

    public String getStadiumName() {
        return stadiumName;
    }

    public Integer getStadiumSeats() {
        return stadiumSeats;
    }

    public String getNetTransferRecord() {
        return netTransferRecord;
    }

    public String getCoachName() {
        return coachName;
    }

    public String getLastSeason() {
        return lastSeason;
    }

    public String getUrl() {
        return url;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public void setClubCode(String clubCode) {
        this.clubCode = clubCode;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDomesticCompetitionId(String domesticCompetitionId) {
        this.domesticCompetitionId = domesticCompetitionId;
    }

    public void setTotalMarketValue(Double totalMarketValue) {
        this.totalMarketValue = totalMarketValue;
    }

    public void setSquadSize(Integer squadSize) {
        this.squadSize = squadSize;
    }

    public void setAverageAge(Double averageAge) {
        this.averageAge = averageAge;
    }

    public void setForeignersNumber(Integer foreignersNumber) {
        this.foreignersNumber = foreignersNumber;
    }

    public void setForeignersPercentage(Double foreignersPercentage) {
        this.foreignersPercentage = foreignersPercentage;
    }

    public void setNationalTeamPlayers(Integer nationalTeamPlayers) {
        this.nationalTeamPlayers = nationalTeamPlayers;
    }

    public void setStadiumName(String stadiumName) {
        this.stadiumName = stadiumName;
    }

    public void setStadiumSeats(Integer stadiumSeats) {
        this.stadiumSeats = stadiumSeats;
    }

    public void setNetTransferRecord(String netTransferRecord) {
        this.netTransferRecord = netTransferRecord;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public void setLastSeason(String lastSeason) {
        this.lastSeason = lastSeason;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @Override
    public String toString() {
        return "Clubs{" +
                "clubId=" + clubId +
                ", clubCode='" + clubCode + '\'' +
                ", name='" + name + '\'' +
                ", domesticCompetitionId='" + domesticCompetitionId + '\'' +
                ", totalMarketValue=" + totalMarketValue +
                ", squadSize=" + squadSize +
                ", averageAge=" + averageAge +
                ", foreignersNumber=" + foreignersNumber +
                ", foreignersPercentage=" + foreignersPercentage +
                ", nationalTeamPlayers=" + nationalTeamPlayers +
                ", stadiumName='" + stadiumName + '\'' +
                ", stadiumSeats=" + stadiumSeats +
                ", netTransferRecord='" + netTransferRecord + '\'' +
                ", coachName='" + coachName + '\'' +
                ", lastSeason='" + lastSeason + '\'' +
                ", url='" + url + '\'' +
                '}';
    }
}
