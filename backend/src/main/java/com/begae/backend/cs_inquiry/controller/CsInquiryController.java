package com.begae.backend.cs_inquiry.controller;

import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.*;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.cs_inquiry.service.CsInquiryService;
import com.begae.backend.global.security.principal.OauthUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.begae.backend.global.aop.require_admin.RequireAdmin;

import java.util.Map;

@Tag(name = "고객 문의", description = "고객 문의 작성, 수정, 삭제, 조회 및 답변 관련 API")
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
    @Operation(summary = "문의 작성", description = "로그인한 사용자가 새로운 고객 문의를 작성합니다.")
    @ApiResponse(responseCode = "201", description = "문의가 성공적으로 작성되었습니다.")
    public ResponseEntity<CreateCsInquiryResponseDto> writeCsInquiry(
        @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
        @ModelAttribute @Valid CreateCsInquiryRequestDto request
    ) {
        CreateCsInquiryResponseDto response = csInquiryService.createCsInquiry(user.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 문의를 수정하는 API
     * @param user
     * @param inquiryId
     * @param request
     * @return
     */
    @PatchMapping("/{inquiryId}")
    @Operation(summary = "문의 수정", description = "작성자가 본인의 고객 문의를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "문의가 성공적으로 수정되었습니다.")
    public ResponseEntity<UpdateCsInquiryResponseDto> patchCsInquiry(
        @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
        @Parameter(description = "수정할 문의 ID", example = "1") @PathVariable(name = "inquiryId") Integer inquiryId,
        @ModelAttribute @Valid UpdateCsInquiryRequestDto request
    ) {
        UpdateCsInquiryResponseDto response = csInquiryService.updateCsInquiry(user.getUserId(), inquiryId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 문의를 삭제하는 API
     * @param user
     * @param inquiryId
     * @return
     */
    @DeleteMapping("/{inquiryId}")
    @Operation(summary = "문의 삭제", description = "작성자가 본인의 고객 문의를 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "문의가 성공적으로 삭제되었습니다.")
    public ResponseEntity<Map<String, Object>> deleteCsInquiry(
        @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
        @Parameter(description = "삭제할 문의 ID", example = "1") @PathVariable(name = "inquiryId") Integer inquiryId
    ) {
        csInquiryService.deleteCsInquiry(user.getUserId(), inquiryId);
        return ResponseEntity.ok(Map.of());
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
    @Operation(summary = "문의사항 목록 조회 (관리자)", description = "관리자가 필터링 및 페이징을 통해 전체 문의사항 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "문의사항 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<AdminCsInquiryListResponseDto> getCsInquiry(
        @Parameter(description = "문의 카테고리 필터") @RequestParam(name = "category", required = false) InquiryType category,
        @Parameter(description = "검색 키워드 (제목/내용)") @RequestParam(name = "search", required = false) String search,
        @Parameter(description = "페이지 크기", example = "10") @RequestParam(name = "size", required = false, defaultValue = "10") @Min(1) int size,
        @Parameter(description = "마지막으로 조회된 문의 ID (커서 페이징용)", example = "100") @RequestParam(name = "lastInquiryId", required = false) Integer lastInquiryId
    ) {
        AdminCsInquiryListResponseDto response = csInquiryService.getCsInquiries(category, search, size, lastInquiryId);
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
    @Operation(summary = "문의사항 답변 작성 (관리자)", description = "관리자가 특정 문의사항에 대한 답변을 작성합니다.")
    @ApiResponse(responseCode = "200", description = "답변이 성공적으로 작성되었습니다.")
    public ResponseEntity<ReplyCsInquiryResponseDto> replyToCsInquiry(
        @Parameter(description = "답변할 문의 ID", example = "1") @PathVariable(name = "inquiryId") Integer inquiryId,
        @RequestBody @Valid ReplyCsInquiryRequestDto request
    ) {
        ReplyCsInquiryResponseDto response = csInquiryService.replyToCsInquiry(inquiryId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 내가 작성한 문의를 조회하는 API
     * @param user
     * @param size
     * @param lastInquiryId
     * @return
     */
    @GetMapping("/my")
    @Operation(summary = "내가 작성한 문의 목록 조회", description = "로그인한 사용자가 본인이 작성한 문의 목록을 페이징하여 조회합니다.")
    @ApiResponse(responseCode = "200", description = "내가 작성한 문의 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<UserCsInquiryListResponseDto> getUserCsInquiry(
        @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
        @Parameter(description = "페이지 크기", example = "10") @RequestParam(name = "size", required = false, defaultValue = "10") @Min(1) int size,
        @Parameter(description = "마지막으로 조회된 문의 ID (커서 페이징용)", example = "100") @RequestParam(name = "lastInquiryId", required = false) Integer lastInquiryId
    ) {
        UserCsInquiryListResponseDto response = csInquiryService.getUserCsInquiry(user.getUserId(), size, lastInquiryId);
        return ResponseEntity.ok(response);
    }

    /**
     * 문의를 종료(완료)하는 API
     * @param user
     * @param inquiryId
     * @return
     */
    @PatchMapping("/{inquiryId}/close")
    @Operation(summary = "문의 종료 (완료)", description = "작성자가 문의가 해결되었음을 확인하고 문의를 종료(완료) 처리합니다.")
    @ApiResponse(responseCode = "200", description = "문의가 성공적으로 종료되었습니다.")
    public ResponseEntity<Void> closeCsInquiry(
        @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
        @Parameter(description = "종료할 문의 ID", example = "1") @PathVariable(name = "inquiryId") Integer inquiryId
    ) {
        csInquiryService.closeCsInquiry(user.getUserId(), inquiryId);
        return ResponseEntity.ok().build();
    }

    /**
     * 문의의 카테고리들을 조회하는 API
     * @return
     */
    @GetMapping("/category")
    @Operation(summary = "문의 카테고리 목록 조회", description = "고객 문의 시 선택할 수 있는 카테고리(타입) 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "카테고리 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<InquiryTypeListResponseDto> getCsInquiryCategory() {
        return ResponseEntity.ok(csInquiryService.getInquiryTypes());
    }
}
