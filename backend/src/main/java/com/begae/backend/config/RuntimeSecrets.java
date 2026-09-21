package com.begae.backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import org.flywaydb.core.Flyway;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

/** Host-published, read-only generation; secret values never enter the process environment. */
public final class RuntimeSecrets implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    static final Set<String> RUNTIME_NAMES = Set.of("MYSQL_USER", "MYSQL_PASSWORD", "REDIS_USERNAME",
            "REDIS_PASSWORD", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "ADMIN_PASSWORD", "JWT_SECRET_KEY",
            "KAKAO_REST_API_KEY", "GOOGLE_API_KEY", "TOUR_API_KEY", "ANTHROPIC_API_KEY",
            "OAUTH_GOOGLE_CLIENT_SECRET", "OAUTH_KAKAO_CLIENT_SECRET", "OAUTH_NAVER_CLIENT_SECRET");
    static final Set<String> MIGRATION_NAMES = Set.of("MYSQL_USER", "MYSQL_PASSWORD");
    private static final Path ROOT = Path.of("/run/oci-service-secrets");

    @Override public void initialize(ConfigurableApplicationContext context) {
        var env = context.getEnvironment();
        String mode = env.getProperty("ILCHUL_RUNTIME_MODE", "local");
        if (mode.equals("local")) return;
        if (!mode.equals("vault")) throw new IllegalStateException("RUNTIME_SECRET_UNAVAILABLE");
        env.getPropertySources().addFirst(new MapPropertySource("vaultRuntime",
                runtimeProperties(read(ROOT.resolve("ilchul-backend"), RUNTIME_NAMES, 0))));
    }

    static Map<String, Object> runtimeProperties(Map<String, String> values) {
        Map<String, Object> result = new HashMap<>(values);
        result.put("spring.datasource.username", values.get("MYSQL_USER"));
        result.put("spring.datasource.password", values.get("MYSQL_PASSWORD"));
        result.put("spring.data.redis.username", values.get("REDIS_USERNAME"));
        result.put("spring.data.redis.password", values.get("REDIS_PASSWORD"));
        result.put("spring.flyway.enabled", false);
        result.put("spring.jpa.hibernate.ddl-auto", "none");
        result.put("management.endpoint.health.show-details", "never");
        return Map.copyOf(result);
    }

    static Map<String, String> read(Path directory, Set<String> names, int owner) {
        try {
            if (!directory.isAbsolute()) throw new IllegalStateException();
            int gid = check(directory, owner, -1, 0750, 0040000);
            Path link = directory.resolve("current");
            var linkStat = Files.readAttributes(link, "unix:uid,mode", LinkOption.NOFOLLOW_LINKS);
            if (!Files.isSymbolicLink(link) || (int) linkStat.get("uid") != owner) throw new IllegalStateException();
            String target = Files.readSymbolicLink(link).toString();
            if (!target.matches("g-[A-Za-z0-9]{6}")) throw new IllegalStateException();
            Path generation = directory.resolve(target);
            check(generation, owner, gid, 0750, 0040000);
            Path file = generation.resolve("CONFIG_JSON");
            check(file, owner, gid, 0640, 0100000);
            var info = Files.readAttributes(file, "unix:nlink,size", LinkOption.NOFOLLOW_LINKS);
            long size = (long) info.get("size");
            if ((int) info.get("nlink") != 1 || size < 1 || size > 65536) throw new IllegalStateException();
            ByteBuffer bytes = ByteBuffer.allocate(65537);
            try (var channel = FileChannel.open(file, StandardOpenOption.READ, LinkOption.NOFOLLOW_LINKS)) {
                while (bytes.hasRemaining() && channel.read(bytes) > 0) { }
                if (bytes.position() != size) throw new IllegalStateException();
            }
            bytes.flip();
            String json = StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
                    .decode(bytes).toString();
            var node = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                    .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS).readTree(json);
            if (node == null || !node.isObject() || node.size() != names.size()) throw new IllegalStateException();
            Map<String, String> result = new HashMap<>();
            for (String name : names) {
                var value = node.get(name);
                if (value == null || !value.isTextual() || value.textValue().isBlank()
                        || value.textValue().indexOf('\0') >= 0) throw new IllegalStateException();
                result.put(name, value.textValue());
            }
            return Map.copyOf(result);
        } catch (Exception ignored) {
            throw new IllegalStateException("RUNTIME_SECRET_UNAVAILABLE");
        }
    }

    private static int check(Path path, int owner, int group, int permissions, int type) throws Exception {
        var stat = Files.readAttributes(path, "unix:uid,gid,mode", LinkOption.NOFOLLOW_LINKS);
        int gid = (int) stat.get("gid"), mode = (int) stat.get("mode");
        if ((int) stat.get("uid") != owner || (group >= 0 && gid != group)
                || (mode & 07777) != permissions || (mode & 0170000) != type) throw new IllegalStateException();
        return gid;
    }

    /** No Spring context, HTTP, Redis, OAuth, storage or profiling agent in this host-only job. */
    public static void migrate() {
        var values = read(ROOT.resolve("ilchul-migration"), MIGRATION_NAMES, 0);
        Flyway.configure().dataSource("jdbc:mysql://mysql:3306/ilchul_db?serverTimezone=Asia/Seoul",
                values.get("MYSQL_USER"), values.get("MYSQL_PASSWORD"))
                .locations("classpath:db/migration").cleanDisabled(true).baselineOnMigrate(false)
                .loggers("none").load().migrate();
    }
}
