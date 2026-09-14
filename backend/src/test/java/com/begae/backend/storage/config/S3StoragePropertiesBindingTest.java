package com.begae.backend.storage.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import org.springframework.core.io.ClassPathResource;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * application.yml 의 cloud.aws.s3 설정이 운영 ENV_FILE 형식과 STORAGE_* 형식 환경변수 모두로 채워지는지 확인한다.
 */
class S3StoragePropertiesBindingTest {

    @Test
    void 운영_ENV_FILE_형식의_환경변수로_설정된다() throws Exception {
        S3StorageProperties properties = bindWithEnvironment(Map.of(
                "CLOUD_AWS_S3_ENDPOINT", "http://minio:9000",
                "CLOUD_AWS_S3_BUCKET", "ilchul",
                "CLOUD_AWS_S3_REGION", "ap-northeast-1",
                "STORAGE_PUBLIC_URL", "https://storage.example.com/ilchul"
        ));

        assertThat(properties.endpoint()).isEqualTo("http://minio:9000");
        assertThat(properties.bucket()).isEqualTo("ilchul");
        assertThat(properties.region()).isEqualTo("ap-northeast-1");
        assertThat(properties.publicBaseUrl()).isEqualTo("https://storage.example.com/ilchul");
    }

    @Test
    void STORAGE_형식의_환경변수로도_엔드포인트까지_설정된다() throws Exception {
        S3StorageProperties properties = bindWithEnvironment(Map.of(
                "STORAGE_ENDPOINT", "http://localhost:9000",
                "STORAGE_BUCKET_NAME", "ilchul-local",
                "STORAGE_REGION", "us-east-1",
                "STORAGE_PUBLIC_URL", "http://localhost:9000/ilchul-local"
        ));

        assertThat(properties.endpoint()).isEqualTo("http://localhost:9000");
        assertThat(properties.bucket()).isEqualTo("ilchul-local");
        assertThat(properties.region()).isEqualTo("us-east-1");
        assertThat(properties.publicBaseUrl()).isEqualTo("http://localhost:9000/ilchul-local");
    }

    @Test
    void 엔드포인트와_공개_URL이_없으면_빈_값으로_두고_미치환_문자열을_넘기지_않는다() throws Exception {
        S3StorageProperties properties = bindWithEnvironment(Map.of(
                "STORAGE_BUCKET_NAME", "ilchul",
                "STORAGE_REGION", "ap-northeast-2"
        ));

        assertThat(properties.endpoint()).isNullOrEmpty();
        assertThat(properties.publicBaseUrl()).isNullOrEmpty();
        assertThat(properties.hasPublicBaseUrl()).isFalse();
    }

    private S3StorageProperties bindWithEnvironment(Map<String, Object> environmentVariables) throws Exception {
        StandardEnvironment environment = new StandardEnvironment();
        environment.getPropertySources().replace(
                StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                new SystemEnvironmentPropertySource(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME, environmentVariables)
        );
        environment.getPropertySources().remove(StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME);
        new YamlPropertySourceLoader()
                .load("application.yml", new ClassPathResource("application.yml"))
                .forEach(environment.getPropertySources()::addLast);
        ConfigurationPropertySources.attach(environment);

        return Binder.get(environment).bind("cloud.aws.s3", S3StorageProperties.class).get();
    }
}
