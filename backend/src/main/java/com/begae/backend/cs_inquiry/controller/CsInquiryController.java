package com.begae.backend.cs_inquiry.controller;

import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryListResponseDto;
import com.begae.backend.cs_inquiry.dto.response.InquiryTypeListResponseDto;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.cs_inquiry.service.CsInquiryService;
import com.begae.backend.user.auth.OauthUserDetails;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.begae.backend.global.aop.require_admin.RequireAdmin;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cs-inquiry")
public class CsInquiryController {

    private final CsInquiryService csInquiryService;
    
    /**
     * 문의를 작성하는 API
     * @param user
     * @param request
     * @return
     */
    @PostMapping
    public ResponseEntity<Integer> writeCsInquiry(
        @AuthenticationPrincipal OauthUserDetails user,
        @ModelAttribute @Valid CreateCsInquiryRequestDto request
    ) {
        Integer inquiryId = csInquiryService.createCsInquiry(user.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(inquiryId);
    }

    /**
     * 문의를 수정하는 API
     * @param user
     * @param inquiryId
     * @param request
     * @return
     */
    @PatchMapping("/{inquiryId}")
    public ResponseEntity<Integer> patchCsInquiry(
        @AuthenticationPrincipal OauthUserDetails user,
        @PathVariable(name = "inquiryId") Integer inquiryId,
        @ModelAttribute @Valid UpdateCsInquiryRequestDto request
    ) {
        Integer updatedId = csInquiryService.updateCsInquiry(user.getUserId(), inquiryId, request);
        return ResponseEntity.ok(updatedId);
    }

    /**
     * 문의를 삭제하는 API
     * @param user
     * @param inquiryId
     * @return
     */
    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<Void> deleteCsInquiry(
        @AuthenticationPrincipal OauthUserDetails user,
        @PathVariable(name = "inquiryId") Integer inquiryId
    ) {
        csInquiryService.deleteCsInquiry(user.getUserId(), inquiryId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 문의사항들을 조회하는 API(관리자)
     * @param category
     * @param search
     * @param size
     * @param lastInquiryId
     * @return
     */
    @GetMapping
    @RequireAdmin
    public ResponseEntity<CsInquiryListResponseDto> getCsInquiry(
        @RequestParam(name = "category", required = false) InquiryType category,
        @RequestParam(name = "search", required = false) String search,
        @RequestParam(name = "size", required = false, defaultValue = "10") @Min(1) int size,
        @RequestParam(name = "lastInquiryId", required = false) Integer lastInquiryId
    ) {
        CsInquiryListResponseDto response = csInquiryService.getCsInquiries(category, search, size, lastInquiryId);
        return ResponseEntity.ok(response);
    }

    /**
     * 문의사항에 답변을 작성하는 API(관리자)
     * @param inquiryId
     * @param request
     * @return
     */
    @RequireAdmin
    @PostMapping("/{inquiryId}/reply")
    public ResponseEntity<Void> replyToCsInquiry(
        @PathVariable(name = "inquiryId") Integer inquiryId,
        @RequestBody @Valid ReplyCsInquiryRequestDto request
    ) {
        csInquiryService.replyToCsInquiry(inquiryId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 내가 작성한 문의를 조회하는 API
     * @param user
     * @param size
     * @param lastInquiryId
     * @return
     */
    @GetMapping("/my")
    public ResponseEntity<CsInquiryListResponseDto> getUserCsInquiry(
        @AuthenticationPrincipal OauthUserDetails user,
        @RequestParam(name = "size", required = false, defaultValue = "10") @Min(1) int size,
        @RequestParam(name = "lastInquiryId", required = false) Integer lastInquiryId
    ) {
        CsInquiryListResponseDto response = csInquiryService.getUserCsInquiry(user.getUserId(), size, lastInquiryId);
        return ResponseEntity.ok(response);
    }

    /**
     * 문의를 종료(완료)하는 API
     * @param user
     * @param inquiryId
     * @return
     */
    @PatchMapping("/{inquiryId}/close")
    public ResponseEntity<Void> closeCsInquiry(
        @AuthenticationPrincipal OauthUserDetails user,
        @PathVariable(name = "inquiryId") Integer inquiryId
    ) {
        csInquiryService.closeCsInquiry(user.getUserId(), inquiryId);
        return ResponseEntity.ok().build();
    }

    /**
     * 문의의 카테고리들을 조회하는 API
     * @return
     */
    @GetMapping("/category")
    public ResponseEntity<InquiryTypeListResponseDto> getCsInquiryCategory() {
        return ResponseEntity.ok(csInquiryService.getInquiryTypes());
    }
}
