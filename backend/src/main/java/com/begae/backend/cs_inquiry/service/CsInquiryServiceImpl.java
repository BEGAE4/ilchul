package com.begae.backend.cs_inquiry.service;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.*;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.cs_inquiry.exception.CsInquiryErrorCode;
import com.begae.backend.cs_inquiry.repository.CsInquiryRepository;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CsInquiryServiceImpl implements CsInquiryService {

    private final CsInquiryRepository csInquiryRepository;
    private final UserRepository userRepository;

    @Override
    public CreateCsInquiryResponseDto createCsInquiry(Integer userId, CreateCsInquiryRequestDto requestDto) {
        User user = readUser(userId);

        InquiryType type = requestDto.inquiryType();
        CsInquiry inquiry = CsInquiry.of(user, requestDto.title(), requestDto.content(), type);
        
        // TODO: 동료가 구현 완료 시 MinIO/S3 업로드 모듈과 연동 예정 (파일 저장 및 URL 매핑)
        // if (requestDto.images() != null && !requestDto.images().isEmpty()) {
        //     List<String> uploadedUrls = s3Service.upload(requestDto.images());
        //     for (String url : uploadedUrls) {
        //         inquiry.addImage(CsInquiryImage.of(inquiry, url));
        //     }
        // }

        CsInquiry savedInquiry = csInquiryRepository.save(inquiry);

        return CreateCsInquiryResponseDto.from(savedInquiry);
    }

    @Override
    @Transactional
    public UpdateCsInquiryResponseDto updateCsInquiry(Integer userId, Integer inquiryId, UpdateCsInquiryRequestDto requestDto) {
        CsInquiry inquiry = readCsInquiry(inquiryId);

        checkDeleted(inquiry);

        if (inquiry.getInquiryStatus() != InquiryStatus.OPEN) {
            throw new CustomException(CsInquiryErrorCode.CANNOT_UPDATE_INQUIRY);
        }

        if (!inquiry.getUser().getUserId().equals(userId)) {
            throw new CustomException(CsInquiryErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 1. 이미지 삭제 처리 (deleteImageIds 존재 시)
        if (requestDto.deleteImageIds() != null && !requestDto.deleteImageIds().isEmpty()) {
            inquiry.getImages().removeIf(img -> requestDto.deleteImageIds().contains(img.getImageId()));
        }

        // 2. 새로운 이미지 추가 처리 플레이스홀더
        // TODO: 동료가 구현 완료 시 MinIO/S3 업로드 모듈과 연동 예정 (신규 이미지 추가)
        // if (requestDto.newImages() != null && !requestDto.newImages().isEmpty()) {
        //     List<String> uploadedUrls = s3Service.upload(requestDto.newImages());
        //     for (String url : uploadedUrls) {
        //         inquiry.addImage(CsInquiryImage.of(inquiry, url));
        //     }
        // }

        InquiryType type = requestDto.inquiryType();
        inquiry.updateContent(requestDto.title(), requestDto.content(), type);
        return UpdateCsInquiryResponseDto.from(inquiry);
    }

    @Override
    @Transactional
    public void deleteCsInquiry(Integer userId, Integer inquiryId) {
        CsInquiry inquiry = readCsInquiry(inquiryId);

        checkDeleted(inquiry);

        if (!inquiry.getUser().getUserId().equals(userId)) {
            throw new CustomException(CsInquiryErrorCode.UNAUTHORIZED_ACCESS);
        }

        inquiry.deleteInquiry();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCsInquiryListResponseDto getCsInquiries(InquiryType category, String search, int size, Integer lastInquiryId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<CsInquiry> inquiries = csInquiryRepository.findByCursor(
                lastInquiryId,
                (category != null) ? category : null,
                (search != null && !search.isBlank()) ? search : null,
                pageable
        );

        boolean hasNext = inquiries.size() > size;
        if (hasNext) {
            inquiries = inquiries.subList(0, size);
        }

        long totalCount = csInquiryRepository.countByFilters(
                (category != null) ? category : null,
                (search != null && !search.isBlank()) ? search : null
        );

        return AdminCsInquiryListResponseDto.of(inquiries, hasNext, totalCount);
    }

    @Override
    public ReplyCsInquiryResponseDto replyToCsInquiry(Integer inquiryId, ReplyCsInquiryRequestDto requestDto) {
        CsInquiry inquiry = readCsInquiry(inquiryId);

        checkDeleted(inquiry);

        if (inquiry.getInquiryStatus() == InquiryStatus.CLOSED) {
            throw new CustomException(CsInquiryErrorCode.ALREADY_ANSWERED);
        }

        inquiry.reply(requestDto.content());
        return ReplyCsInquiryResponseDto.from(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public InquiryTypeListResponseDto getInquiryTypes() {
        List<InquiryTypeResponseDto> categories = Arrays.stream(InquiryType.values())
                .map(InquiryTypeResponseDto::from)
                .toList();
        return InquiryTypeListResponseDto.from(categories);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserCsInquiryListResponseDto getUserCsInquiry(Integer userId, int size, Integer lastInquiryId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<CsInquiry> inquiries = csInquiryRepository.findByUserCursor(
                userId,
                lastInquiryId,
                pageable
        );

        boolean hasNext = inquiries.size() > size;
        if (hasNext) {
            inquiries = inquiries.subList(0, size);
        }

        return UserCsInquiryListResponseDto.of(inquiries, hasNext);
    }

    @Override
    public void closeCsInquiry(Integer userId, Integer inquiryId) {
        CsInquiry inquiry = readCsInquiry(inquiryId);

        checkDeleted(inquiry);

        if (!inquiry.getUser().getUserId().equals(userId)) {
            throw new CustomException(CsInquiryErrorCode.UNAUTHORIZED_ACCESS);
        }

        inquiry.close();
    }

    // --------------------- 내부 메서드 ----------------------

    private User readUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
    }

    private CsInquiry readCsInquiry(Integer inquiryId) {
        return csInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException(CsInquiryErrorCode.INQUIRY_NOT_FOUND));
    }

    private void checkDeleted(CsInquiry inquiry) {
        if (inquiry.getIsDeleted()) {
            throw new CustomException(CsInquiryErrorCode.INQUIRY_DELETED);
        }
    }

}
