package com.icaro.icarobackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.model.Work;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class OrcidService {

    private final RestTemplate restTemplate;

    public OrcidService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Investigator fetchInvestigator(String orcid) {
        // GET
        JsonNode root = restTemplate.getForObject("/{orcid}/record", JsonNode.class, orcid);
        return Investigator.builder()
                .orcid(orcid)
                .givenNames(root.at("/person/name/given-names/value").asText(""))
                .familyName(root.at("/person/name/family-name/value").asText(""))
                //TODO Preguntar a antonio si cogemos el email de los arrays 0, u otro!
                .email(root.at("/person/emails/email/0/email").asText(""))
                .biography(root.at("/person/biography/content").asText(""))
                .build();
    }

    public List<Work> fetchWorks(String orcidInvestigator) {
        JsonNode root   = restTemplate.getForObject(
                "/{orcid}/works", JsonNode.class, orcidInvestigator);
        JsonNode groups = root.path("group");
        List<Work> works = new ArrayList<>();

        for (JsonNode group : groups) {
            List<String> extIds = StreamSupport.stream(
                            group.path("external-ids")
                                    .path("external-id")
                                    .spliterator(), false)
                    .map(e -> e.path("external-id-value").asText(""))
                    .filter(id -> !id.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

            for (JsonNode summary : group.path("work-summary")) {
                String putCode = summary.path("put-code").asText("");
                String title   = summary.path("title")
                        .path("title")
                        .path("value")
                        .asText("");
                String type    = summary.path("type").asText("");

                works.add(Work.builder()
                        .putCode(putCode)
                        .title(title)
                        .type(type)
                        .externalIds(extIds)
                        .build());
            }
        }
        return works;
    }


}
