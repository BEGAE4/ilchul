package com.begae.backend.user.service;

import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MyPageServiceProfileImageTest {

    @Test
    void 새_프로필_사진을_저장하고_이전_저장소_파일을_삭제한다() throws Exception {
        User user = User.builder()
                .userNickname("사용자")
                .userImg("https://cdn.example.com/users/profile/old.png")
                .userImgKey("users/profile/old.png")
                .build();
        FakeImageStorage storage = new FakeImageStorage();
        MyPageServiceImpl service = serviceFor(user, storage);

        UserProfileResponseDto response = service.uploadProfileImage(image(), 1);

        assertThat(response.getUserImg()).isEqualTo("https://cdn.example.com/users/profile/new.png");
        assertThat(user.getUserImgKey()).isEqualTo("users/profile/new.png");
        assertThat(storage.deletedKeys).containsExactly("users/profile/old.png");
    }

    @Test
    void 프로필_사진을_삭제하면_null을_반환하고_저장소_파일을_삭제한다() {
        User user = User.builder()
                .userNickname("사용자")
                .userImg("https://cdn.example.com/users/profile/old.png")
                .userImgKey("users/profile/old.png")
                .build();
        FakeImageStorage storage = new FakeImageStorage();
        MyPageServiceImpl service = serviceFor(user, storage);

        UserProfileResponseDto response = service.deleteProfileImage(1);

        assertThat(response.getUserImg()).isNull();
        assertThat(user.isSocialImageSyncDisabled()).isTrue();
        assertThat(storage.deletedKeys).containsExactly("users/profile/old.png");
    }

    private MyPageServiceImpl serviceFor(User user, FakeImageStorage storage) {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        return new MyPageServiceImpl(
                userRepository,
                mock(PlanRepository.class),
                mock(ScrappedPlanRepository.class),
                storage,
                new ImageFileCleaner(storage),
                new ProfileImageProcessor()
        );
    }

    private MultipartFile image() throws Exception {
        BufferedImage image = new BufferedImage(32, 32, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(image, "png", bytes);
        return new MockMultipartFile("image", "profile.png", "image/png", bytes.toByteArray());
    }

    private static final class FakeImageStorage implements ImageStorageService {
        private final List<String> deletedKeys = new ArrayList<>();

        @Override
        public StoredImage upload(MultipartFile file, String directory) {
            throw new UnsupportedOperationException();
        }

        @Override
        public StoredImage uploadByUrl(byte[] bytes, String originalFilename, String contentType, String directory) {
            return new StoredImage(
                    "users/profile/new.png",
                    "https://cdn.example.com/users/profile/new.png",
                    originalFilename,
                    contentType,
                    (long) bytes.length
            );
        }

        @Override
        public void delete(String imageKey) {
            deletedKeys.add(imageKey);
        }

        @Override
        public String getAccessibleUrl(String imageKey) {
            return "https://cdn.example.com/" + imageKey;
        }
    }
}
