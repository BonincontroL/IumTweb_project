package it.iumtweb.springserver;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") // Imposta l'origine consentita
                .allowedMethods("GET", "POST", "PUT", "DELETE") //  i metodi consentiti
                .allowCredentials(true); // Consente l'invio dei cookie
    }
}
