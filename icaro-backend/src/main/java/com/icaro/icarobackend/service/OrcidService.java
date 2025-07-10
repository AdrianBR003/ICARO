package com.icaro.icarobackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.icaro.icarobackend.model.Investigator;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OrcidService {

    private final RestTemplate restTemplate;

    public OrcidService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Investigator fetchInvestigator(String orcid) {
        JsonNode root = restTemplate.getForObject("/{orcid}/record", JsonNode.class, orcid);
        return Investigator.builder()
                .orcid(orcid)
                .givenNames(root.at("/person/name/given-names/value").asText(""))
                .familyName(root.at("/person/name/family-name/values").asText(""))
                //TODO Preguntar a antonio si cogemos el email de los arrays 0, u otro!
                .email(root.at("/person/emails/email/0/email").asText(""))
                .biography(root.at("/person/biography/content").asText(""))
                .build();


    }

}
