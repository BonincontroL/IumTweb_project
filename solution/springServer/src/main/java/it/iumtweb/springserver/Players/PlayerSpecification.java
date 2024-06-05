package it.iumtweb.springserver.Players;

import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for constructing Specifications to filter player entities based on various criteria.
 * We used this class to manage  /getByCompIdNationalityAndRole route and to create a flexible filter for players
 */
public class PlayerSpecification {
    public static Specification<Players> hasCurrentClubDomesticCompetitionId(String currentClubDomesticCompetitionId){
        return ((root, query, criteriaBuilder) -> currentClubDomesticCompetitionId==null? null:criteriaBuilder.equal(root.get("currentClubDomesticCompetitionId"),currentClubDomesticCompetitionId));
    }
    public static Specification<Players> hasCountryOfCitizenship(String countryOfCitizenship){
        return ((root, query, criteriaBuilder) -> countryOfCitizenship==null? null:criteriaBuilder.equal(root.get("countryOfCitizenship"),countryOfCitizenship));
    }
    public static Specification<Players> hasSubPosition(String subPosition){
        return ((root, query, criteriaBuilder) -> subPosition==null? null:criteriaBuilder.equal(root.get("subPosition"),subPosition));
    }
    public static Specification<Players> buildSpecification(String currentClubDomesticCompetitionId, String countryOfBirth,String subPosition ){
        List<Specification<Players>> specs= new ArrayList<>();
        if(currentClubDomesticCompetitionId!=null) specs.add(hasCurrentClubDomesticCompetitionId(currentClubDomesticCompetitionId));
        if(countryOfBirth!=null) specs.add(hasCountryOfCitizenship(countryOfBirth));
        if(subPosition!=null) specs.add(hasSubPosition(subPosition));
        return specs.stream().reduce(Specification::and).orElse(null);
    }
}
