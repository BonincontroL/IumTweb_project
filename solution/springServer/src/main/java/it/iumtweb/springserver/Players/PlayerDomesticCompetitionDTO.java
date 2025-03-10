package it.iumtweb.springserver.Players;

import java.util.Objects;

/**
 * this class represents a DTO that represent a single domestic competition with his ID and name
 */
public class PlayerDomesticCompetitionDTO {
    private String id; //the competition ID
    private String name; //the competition name

    public PlayerDomesticCompetitionDTO(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerDomesticCompetitionDTO that = (PlayerDomesticCompetitionDTO) o;
        return Objects.equals(id, that.id) && Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}
