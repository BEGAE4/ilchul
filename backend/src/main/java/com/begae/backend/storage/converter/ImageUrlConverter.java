package com.begae.backend.storage.converter;

import com.begae.backend.storage.config.S3StorageProperties;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 응답에 렌더링할 수 없는 이미지 값이 나가지 않도록 읽을 때 보정한다.
 * <ul>
 *     <li>STORAGE_PUBLIC_URL 미설정 상태로 저장된 "${STORAGE_PUBLIC_URL}/key" 는 현재 base URL로 다시 조합한다.</li>
 *     <li>"img5" 같은 식별자나 빈 값은 null 로 읽어 프론트 기본 이미지로 넘긴다.</li>
 * </ul>
 * 저장 값은 바꾸지 않는다.
 */
@Converter
public class ImageUrlConverter implements AttributeConverter<String, String> {

    private static final Pattern UNRESOLVED_BASE_URL = Pattern.compile("^\\$\\{[^}]*}/*(.*)$");

    private final S3StorageProperties properties;

    /** Spring 컨텍스트 밖(JPA 기본 생성)에서는 base URL 없이 동작한다. */
    public ImageUrlConverter() {
        this((S3StorageProperties) null);
    }

    @Autowired
    public ImageUrlConverter(ObjectProvider<S3StorageProperties> properties) {
        this(properties.getIfAvailable());
    }

    public ImageUrlConverter(S3StorageProperties properties) {
        this.properties = properties;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (!StringUtils.hasText(dbData)) {
            return null;
        }

        Matcher unresolved = UNRESOLVED_BASE_URL.matcher(dbData);
        if (unresolved.matches()) {
            if (properties == null || !properties.hasPublicBaseUrl()) {
                return null;
            }
            return properties.normalizedPublicBaseUrl() + "/" + unresolved.group(1);
        }

        if (dbData.startsWith("https://") || dbData.startsWith("http://")) {
            return dbData;
        }

        return null;
    }
}
