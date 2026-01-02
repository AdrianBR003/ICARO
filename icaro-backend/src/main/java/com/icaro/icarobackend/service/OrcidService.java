package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.model.Investigator;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;
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
        JsonNode root = restTemplate.getForObject("/{orcid}/record", JsonNode.class, orcid);
        return Investigator.builder()
                .orcid(orcid)
                .givenNames(root.at("/person/name/given-names/value").asText(""))
                .familyName(root.at("/person/name/family-name/value").asText(""))
                .email(root.at("/person/emails/email/0/email").asText(""))
                .biography(root.at("/person/biography/content").asText(""))
                .build();
    }

    public List<Work> fetchWorks(String orcidInvestigator) {
        JsonNode root   = restTemplate.getForObject("/{orcid}/works", JsonNode.class, orcidInvestigator);
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
                List<String> typeList = new ArrayList<>();
                // extraer publication-date
                JsonNode pd = summary.path("publication-date");
                String y = pd.path("year").path("value").asText();
                String m = pd.path("month").path("value").asText();
                String d = pd.path("day").path("value").asText();
                LocalDate projectDate = null;
                if (!y.isEmpty()) {
                    int year = Integer.parseInt(y);
                    int month = m.isEmpty() ? 1 : Integer.parseInt(m);
                    int day = d.isEmpty() ? 1 : Integer.parseInt(d);
                    projectDate = LocalDate.of(year, month, day);
                }

                works.add(Work.builder()
                        .id(putCode)
                        .title(title)
                        .tags(typeList)
                        .externalIds(extIds)
                        .projectDate(projectDate)
                        .build());
            }
        }
        return works;
    }

}
