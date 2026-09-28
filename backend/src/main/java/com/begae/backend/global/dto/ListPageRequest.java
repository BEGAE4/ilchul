package com.begae.backend.global.dto;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import org.springframework.data.domain.PageRequest;

public final class ListPageRequest {
    private ListPageRequest() {}

    public static PageRequest of(Integer page, Integer limit) {
        int actualPage = page == null ? 1 : page;
        int actualLimit = limit == null ? 20 : limit;
        if (actualPage < 1 || actualLimit < 1) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
        actualLimit = Math.min(actualLimit, 50);
        if ((long) (actualPage - 1) * actualLimit > Integer.MAX_VALUE) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
        return PageRequest.of(actualPage - 1, actualLimit);
    }
}
