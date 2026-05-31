package com.begae.backend.cs_inquiry.service;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryListResponseDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryResponseDto;
import com.begae.backend.cs_inquiry.dto.response.InquiryTypeListResponseDto;
import com.begae.backend.cs_inquiry.dto.response.InquiryTypeResponseDto;
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
    public Integer createCsInquiry(Integer userId, CreateCsInquiryRequestDto requestDto) {
        User user = readUser(userId);

        CsInquiry inquiry = CsInquiry.of(user, requestDto.content(), requestDto.inquiryType());

        // TODO : 이미지 관련 로직 들어갈 부분

        CsInquiry savedInquiry = csInquiryRepository.save(inquiry);

        return savedInquiry.getInquiryId();
    }

    @Override
    @Transactional
    public Integer updateCsInquiry(Integer userId, Integer inquiryId, UpdateCsInquiryRequestDto requestDto) {
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

        // TODO : 이미지 관련 로직 들어갈 부분

        inquiry.updateContent(requestDto.content(), requestDto.inquiryType());
        return inquiry.getInquiryId();
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
    public CsInquiryListResponseDto getCsInquiries(InquiryType category, String search, int size,
            Integer lastInquiryId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<CsInquiry> inquiries = csInquiryRepository.findByCursor(
                lastInquiryId,
                (category != null) ? category : null,
                (search != null && !search.isBlank()) ? search : null,
                pageable);

        boolean hasNext = inquiries.size() > size;
        if (hasNext) {
            inquiries = inquiries.subList(0, size);
        }

        List<CsInquiryResponseDto> responseDtos = inquiries.stream()
                .map(CsInquiryResponseDto::from)
                .toList();

        return CsInquiryListResponseDto.of(responseDtos, hasNext);
    }

    @Override
    public void replyToCsInquiry(Integer inquiryId, ReplyCsInquiryRequestDto requestDto) {
        CsInquiry inquiry = readCsInquiry(inquiryId);

        checkDeleted(inquiry);

        if (inquiry.getInquiryStatus() == InquiryStatus.CLOSED) {
            throw new CustomException(CsInquiryErrorCode.ALREADY_ANSWERED);
        }

        inquiry.reply(requestDto.answer());
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
    public CsInquiryListResponseDto getUserCsInquiry(Integer userId, int size, Integer lastInquiryId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<CsInquiry> inquiries = csInquiryRepository.findByUserCursor(
                userId,
                lastInquiryId,
                pageable);

        boolean hasNext = inquiries.size() > size;
        if (hasNext) {
            inquiries = inquiries.subList(0, size);
        }

        List<CsInquiryResponseDto> responseDtos = inquiries.stream()
                .map(CsInquiryResponseDto::from)
                .toList();

        return CsInquiryListResponseDto.of(responseDtos, hasNext);
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
