package org.blog.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application entry point.
 *
 * <ul>
 *   <li>{@code @EnableScheduling} — activates {@code @Scheduled} jobs
 *       (e.g. {@link org.blog.backend.auth.scheduler.TokenCleanupScheduler})</li>
 *   <li>{@code @EnableConfigurationProperties} — registers
 *       {@link org.blog.backend.auth.security.CookieProperties} for type-safe config binding</li>
 * </ul>
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableJpaRepositories
@EnableScheduling
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
