package com.begae.backend.cs_inquiry.service;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.domain.CsInquiryImage;
import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.*;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.cs_inquiry.exception.CsInquiryErrorCode;
import com.begae.backend.cs_inquiry.repository.CsInquiryRepository;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class CsInquiryServiceImpl implements CsInquiryService {

    private static final int MAX_IMAGES = 5;

    private final CsInquiryRepository csInquiryRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final ImageFileCleaner imageFileCleaner;

    @Override
    public CreateCsInquiryResponseDto createCsInquiry(Integer userId, CreateCsInquiryRequestDto requestDto) {
        User user = readUser(userId);
        List<MultipartFile> images = files(requestDto.images());
        validateImageCount(images.size());

        InquiryType type = requestDto.inquiryType();
        CsInquiry inquiry = CsInquiry.of(user, requestDto.title(), requestDto.content(), type);
        CsInquiry savedInquiry = csInquiryRepository.save(inquiry);
        uploadImages(savedInquiry, images);

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

        List<MultipartFile> newImages = files(requestDto.newImages());
        Set<Integer> deleteImageIds = requestDto.deleteImageIds() == null
                ? Set.of()
                : new HashSet<>(requestDto.deleteImageIds());
        List<CsInquiryImage> imagesToDelete = inquiry.getImages().stream()
                .filter(image -> deleteImageIds.contains(image.getImageId()))
                .toList();
        validateImageCount(inquiry.getImages().size() - imagesToDelete.size() + newImages.size());

        List<String> deletedKeys = imagesToDelete.stream()
                .map(CsInquiryImage::getStorageKey)
                .toList();
        imagesToDelete.forEach(inquiry::removeImage);
        uploadImages(inquiry, newImages);
        imageFileCleaner.deleteAfterCommit(deletedKeys);

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

        List<String> imageKeys = inquiry.getImages().stream()
                .map(CsInquiryImage::getStorageKey)
                .toList();
        inquiry.clearImages();
        inquiry.deleteInquiry();
        imageFileCleaner.deleteAfterCommit(imageKeys);
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

    @Override
    @Transactional(readOnly = true)
    public CsInquiryDetailResponseDto getCsInquiryDetail(Integer userId, boolean admin, Integer inquiryId) {
        CsInquiry inquiry = readCsInquiry(inquiryId);
        checkDeleted(inquiry);
        checkCanRead(userId, admin, inquiry);
        return CsInquiryDetailResponseDto.from(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public CsInquiryImageContent getCsInquiryImage(Integer userId, boolean admin, Integer inquiryId, Integer imageId) {
        CsInquiry inquiry = readCsInquiry(inquiryId);
        checkDeleted(inquiry);
        checkCanRead(userId, admin, inquiry);
        CsInquiryImage image = inquiry.getImages().stream()
                .filter(candidate -> Objects.equals(candidate.getImageId(), imageId))
                .findFirst()
                .orElseThrow(() -> new CustomException(CsInquiryErrorCode.IMAGE_NOT_FOUND));
        return new CsInquiryImageContent(
                imageStorageService.download(image.getStorageKey()),
                image.getContentType(),
                image.getOriginalFilename()
        );
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

    private void checkCanRead(Integer userId, boolean admin, CsInquiry inquiry) {
        if (!admin && !inquiry.getUser().getUserId().equals(userId)) {
            throw new CustomException(CsInquiryErrorCode.UNAUTHORIZED_ACCESS);
        }
    }

    private List<MultipartFile> files(List<MultipartFile> files) {
        if (files == null) {
            return List.of();
        }
        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();
    }

    private void validateImageCount(int count) {
        if (count > MAX_IMAGES) {
            throw new CustomException(CsInquiryErrorCode.TOO_MANY_IMAGES);
        }
    }

    private void uploadImages(CsInquiry inquiry, List<MultipartFile> images) {
        if (images.isEmpty()) {
            return;
        }
        String directory = "cs-inquiry/" + inquiry.getInquiryId() + "/images";
        for (MultipartFile image : images) {
            StoredImage storedImage = imageStorageService.uploadPrivate(image, directory);
            imageFileCleaner.deleteIfRolledBack(storedImage.imageKey());
            inquiry.addImage(CsInquiryImage.of(inquiry, storedImage));
        }
    }

}
