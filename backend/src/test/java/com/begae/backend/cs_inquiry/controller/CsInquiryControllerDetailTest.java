package com.begae.backend.cs_inquiry.controller;

import com.begae.backend.cs_inquiry.dto.response.CsInquiryDetailResponseDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryImageContent;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.cs_inquiry.service.CsInquiryService;
import com.begae.backend.global.handler.GlobalExceptionHandler;
import com.begae.backend.global.security.principal.OauthUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CsInquiryControllerDetailTest {

    private final CsInquiryService service = mock(CsInquiryService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new CsInquiryController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PrincipalResolver())
                .build();
    }

    @Test
    void 작성자가_문의_상세를_조회한다() throws Exception {
        when(service.getCsInquiryDetail(1, false, 7)).thenReturn(new CsInquiryDetailResponseDto(
                7, "제목", "내용", InquiryType.GENERAL, InquiryStatus.OPEN,
                List.of(), "작성자", null, null, null
        ));

        mockMvc.perform(get("/api/cs-inquiry/7").requestAttr("principal", user(false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inquiryId").value(7))
                .andExpect(jsonPath("$.content").value("내용"));

        verify(service).getCsInquiryDetail(1, false, 7);
    }

    @Test
    void 관리자_권한을_상세_서비스에_전달한다() throws Exception {
        when(service.getCsInquiryDetail(1, true, 7)).thenReturn(new CsInquiryDetailResponseDto(
                7, "제목", "내용", InquiryType.GENERAL, InquiryStatus.OPEN,
                List.of(), "작성자", null, null, null
        ));

        mockMvc.perform(get("/api/cs-inquiry/7").requestAttr("principal", user(true)))
                .andExpect(status().isOk());

        verify(service).getCsInquiryDetail(1, true, 7);
    }

    @Test
    void 인증된_문의_첨부를_원래_MIME으로_반환한다() throws Exception {
        when(service.getCsInquiryImage(1, false, 7, 3))
                .thenReturn(new CsInquiryImageContent(new byte[]{1, 2, 3}, "image/png", "a.png"));

        mockMvc.perform(get("/api/cs-inquiry/7/images/3").requestAttr("principal", user(false)))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"))
                .andExpect(content().bytes(new byte[]{1, 2, 3}));

        verify(service).getCsInquiryImage(1, false, 7, 3);
    }

    private OauthUserDetails user(boolean admin) {
        String role = admin ? "ROLE_ADMIN" : "ROLE_USER";
        return new OauthUserDetails(1, "user@example.com", List.of(new SimpleGrantedAuthority(role)), Map.of());
    }

    private static final class PrincipalResolver implements HandlerMethodArgumentResolver {
        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
        }

        @Override
        public Object resolveArgument(
                MethodParameter parameter,
                ModelAndViewContainer mavContainer,
                NativeWebRequest webRequest,
                org.springframework.web.bind.support.WebDataBinderFactory binderFactory
        ) {
            return webRequest.getAttribute("principal", NativeWebRequest.SCOPE_REQUEST);
        }
    }
}
