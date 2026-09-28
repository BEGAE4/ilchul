package com.begae.backend.cs_inquiry.service;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.domain.CsInquiryImage;
import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryDetailResponseDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryImageContent;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.cs_inquiry.repository.CsInquiryRepository;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CsInquiryServiceImplImageTest {

    @Mock
    private CsInquiryRepository csInquiryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ImageStorageService imageStorageService;
    @Mock
    private ImageFileCleaner imageFileCleaner;
    @InjectMocks
    private CsInquiryServiceImpl service;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = User.builder().userNickname("작성자").build();
        ReflectionTestUtils.setField(owner, "userId", 1);
        lenient().when(userRepository.findById(1)).thenReturn(Optional.of(owner));
    }

    @Test
    void 문의를_작성하면_첨부를_비공개_경로에_저장하고_DB_메타데이터를_연결한다() {
        MultipartFile image = image("images", "a.png");
        when(csInquiryRepository.save(any(CsInquiry.class))).thenAnswer(invocation -> {
            CsInquiry inquiry = invocation.getArgument(0);
            ReflectionTestUtils.setField(inquiry, "inquiryId", 10);
            return inquiry;
        });
        when(imageStorageService.uploadPrivate(image, "cs-inquiry/10/images"))
                .thenReturn(stored("cs-inquiry/10/images/a.png", "a.png"));

        service.createCsInquiry(1, new CreateCsInquiryRequestDto(
                "제목", "내용", InquiryType.GENERAL, List.of(image)
        ));

        ArgumentCaptor<CsInquiry> inquiryCaptor = ArgumentCaptor.forClass(CsInquiry.class);
        verify(csInquiryRepository).save(inquiryCaptor.capture());
        verify(imageStorageService).uploadPrivate(image, "cs-inquiry/10/images");
        verify(imageFileCleaner).deleteIfRolledBack("cs-inquiry/10/images/a.png");
        assertThat(inquiryCaptor.getValue().getImages()).hasSize(1);
    }

    @Test
    void 문의_작성시_이미지는_최대_5장까지만_허용한다() {
        List<MultipartFile> images = List.of(
                image("images", "1.png"), image("images", "2.png"), image("images", "3.png"),
                image("images", "4.png"), image("images", "5.png"), image("images", "6.png")
        );

        assertThatThrownBy(() -> service.createCsInquiry(1, new CreateCsInquiryRequestDto(
                "제목", "내용", InquiryType.GENERAL, images
        ))).isInstanceOfSatisfying(CustomException.class, error ->
                assertThat(error.getErrorCode().getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST));

        verify(csInquiryRepository, never()).save(any());
        verify(imageStorageService, never()).uploadPrivate(any(), any());
    }

    @Test
    void 문의_수정에서_삭제한_첨부는_커밋_후_저장소에서_지운다() {
        CsInquiry inquiry = inquiry(7);
        CsInquiryImage oldImage = CsInquiryImage.of(inquiry, "cs-inquiry/7/images/old.png");
        ReflectionTestUtils.setField(oldImage, "imageId", 3);
        inquiry.addImage(oldImage);
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        service.updateCsInquiry(1, 7, new UpdateCsInquiryRequestDto(
                "수정 제목", "수정 내용", InquiryType.BUG, null, List.of(3)
        ));

        assertThat(inquiry.getImages()).isEmpty();
        verify(imageFileCleaner).deleteAfterCommit(List.of("cs-inquiry/7/images/old.png"));
    }

    @Test
    void 문의를_삭제하면_모든_첨부를_커밋_후_저장소에서_지운다() {
        CsInquiry inquiry = inquiry(7);
        inquiry.addImage(CsInquiryImage.of(inquiry, "cs-inquiry/7/images/a.png"));
        inquiry.addImage(CsInquiryImage.of(inquiry, "cs-inquiry/7/images/b.png"));
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        service.deleteCsInquiry(1, 7);

        assertThat(inquiry.getImages()).isEmpty();
        verify(imageFileCleaner).deleteAfterCommit(List.of(
                "cs-inquiry/7/images/a.png",
                "cs-inquiry/7/images/b.png"
        ));
    }

    @Test
    void 문의_수정_후_남는_이미지와_새_이미지_합이_5장을_넘을_수_없다() {
        CsInquiry inquiry = inquiry(7);
        for (int id = 1; id <= 5; id++) {
            CsInquiryImage existing = CsInquiryImage.of(inquiry, "cs-inquiry/7/images/" + id + ".png");
            ReflectionTestUtils.setField(existing, "imageId", id);
            inquiry.addImage(existing);
        }
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        assertThatThrownBy(() -> service.updateCsInquiry(1, 7, new UpdateCsInquiryRequestDto(
                "제목", "내용", InquiryType.GENERAL, List.of(image("newImages", "new.png")), null
        ))).isInstanceOfSatisfying(CustomException.class, error ->
                assertThat(error.getErrorCode().getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST));

        verify(imageStorageService, never()).uploadPrivate(any(), any());
    }

    @Test
    void 작성자는_문의_상세와_인증된_첨부_URL을_조회한다() {
        CsInquiry inquiry = inquiry(7);
        CsInquiryImage image = CsInquiryImage.of(inquiry, stored("cs-inquiry/7/images/a.png", "a.png"));
        ReflectionTestUtils.setField(image, "imageId", 3);
        inquiry.addImage(image);
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        CsInquiryDetailResponseDto detail = service.getCsInquiryDetail(1, false, 7);

        assertThat(detail.inquiryId()).isEqualTo(7);
        assertThat(detail.images()).singleElement().satisfies(item -> {
            assertThat(item.imageId()).isEqualTo(3);
            assertThat(item.imageUrl()).isEqualTo("/api/cs-inquiry/7/images/3");
        });
    }

    @Test
    void 관리자는_다른_사용자의_문의_상세를_조회한다() {
        CsInquiry inquiry = inquiry(7);
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        assertThat(service.getCsInquiryDetail(99, true, 7).inquiryId()).isEqualTo(7);
    }

    @Test
    void 작성자도_관리자도_아닌_사용자는_문의_상세를_조회할_수_없다() {
        CsInquiry inquiry = inquiry(7);
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        assertThatThrownBy(() -> service.getCsInquiryDetail(99, false, 7))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void 작성자는_비공개_첨부_객체를_백엔드를_통해_읽는다() {
        CsInquiry inquiry = inquiry(7);
        CsInquiryImage image = CsInquiryImage.of(inquiry, stored("cs-inquiry/7/images/a.png", "a.png"));
        ReflectionTestUtils.setField(image, "imageId", 3);
        inquiry.addImage(image);
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));
        when(imageStorageService.download("cs-inquiry/7/images/a.png")).thenReturn(new byte[]{1, 2, 3});

        CsInquiryImageContent content = service.getCsInquiryImage(1, false, 7, 3);

        assertThat(content.bytes()).containsExactly(1, 2, 3);
        assertThat(content.contentType()).isEqualTo("image/png");
        assertThat(content.originalFilename()).isEqualTo("a.png");
    }

    @Test
    void 다른_사용자는_문의_첨부_객체를_읽을_수_없다() {
        CsInquiry inquiry = inquiry(7);
        CsInquiryImage image = CsInquiryImage.of(inquiry, stored("cs-inquiry/7/images/a.png", "a.png"));
        ReflectionTestUtils.setField(image, "imageId", 3);
        inquiry.addImage(image);
        when(csInquiryRepository.findById(7)).thenReturn(Optional.of(inquiry));

        assertThatThrownBy(() -> service.getCsInquiryImage(99, false, 7, 3))
                .isInstanceOf(CustomException.class);

        verify(imageStorageService, never()).download(any());
    }

    private CsInquiry inquiry(int inquiryId) {
        CsInquiry inquiry = CsInquiry.of(owner, "제목", "내용", InquiryType.GENERAL);
        ReflectionTestUtils.setField(inquiry, "inquiryId", inquiryId);
        return inquiry;
    }

    private MultipartFile image(String fieldName, String filename) {
        return new MockMultipartFile(fieldName, filename, "image/png", new byte[]{1});
    }

    private StoredImage stored(String key, String filename) {
        return new StoredImage(key, "https://storage.example.com/ilchul/" + key, filename, "image/png", 1L);
    }
}
