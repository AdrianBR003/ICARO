package com.icaro.icarobackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class OrcidClient {

    @Value("${orcid.api.base-url}")
    private String apiBaseUrl;

    @Value("${orcid.adpi.accept-header:application/vnd.orcid+json}")
    private String acceptHeader;

    @Value("${orcid.api.connect-timeout}")
    private int connectTimeout;

    @Value("${orcid.api.read-timeout}")
    private int readTimeout;

    /**
     * Metodo para realizar la petición a la API, tiene configurados los dos temporizadores
     * de tal forma que:
     *
     * <p>ORCID Inaccesible 5 s -> return: 503</p>
     * <p>ORCID Conecta pero no responde 10 s -> return ReadTimeoutException</p>
     *
     * <p>Rerencia a los datos en application.properties</p>
     * @param builder
     * @return
     */

    @Bean
    public RestTemplate orcidRestTemplate(RestTemplateBuilder builder) {
        return builder
                .rootUri(apiBaseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, acceptHeader)
                .requestFactory(() -> {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout(connectTimeout);
                    factory.setReadTimeout(readTimeout);
                    return factory;
                })
                .build();
    }
}
