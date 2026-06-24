package com.begae.backend.report.util;

import com.begae.backend.report.enums.SortOption;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StringToSortOptionConverter implements Converter<String, SortOption> {

    @Override
    public SortOption convert(@NonNull String source) {
        if (!StringUtils.hasText(source)) {
            return SortOption.CREATED_DESC;
        }
        return SortOption.from(source);
    }
}