package com.begae.backend.place.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.place.dto.PlaceUpsertCommand;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.repository.PlanRepository;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PlaceUpsertWriterTest {

    @Test
    void 일반_장소가_먼저_insert된_경합에서도_웰니스_식별자를_합친다() {
        PlaceRepository repository = mock(PlaceRepository.class);
        Place existing = Place.builder()
                .source(PlaceUpsertCommand.SOURCE_KAKAO)
                .sourceId("K1")
                .placeName("기존 장소")
                .lastFetchedAt(LocalDateTime.now())
                .lastSeenAt(LocalDateTime.now())
                .build();
        ReflectionTestUtils.setField(existing, "placeId", 7);
        when(repository.findPlaceBySourceAndSourceId(PlaceUpsertCommand.SOURCE_KAKAO, "K1"))
                .thenReturn(Optional.of(existing));

        PlaceUpsertWriter writer = new PlaceUpsertWriter(repository);
        int placeId = writer.mergeAfterConflict(wellnessCommand());

        assertThat(placeId).isEqualTo(7);
        assertThat(existing.getWellnessContentId()).isEqualTo("W1");
    }

    @Test
    void insert_고유키_충돌은_새_트랜잭션의_병합으로_복구한다() {
        PlaceUpsertWriter writer = mock(PlaceUpsertWriter.class);
        PlaceServiceImpl service = new PlaceServiceImpl(
                mock(WebClient.class),
                mock(WebClient.class),
                mock(PlaceRepository.class),
                mock(PlanRepository.class),
                writer);
        PlaceUpsertCommand command = wellnessCommand();
        when(writer.insertOrMerge(command))
                .thenThrow(new DataIntegrityViolationException("unique conflict"));
        when(writer.mergeAfterConflict(command)).thenReturn(7);

        assertThat(service.upsertPlace(command)).isEqualTo(7);
        verify(writer).mergeAfterConflict(command);
    }

    private PlaceUpsertCommand wellnessCommand() {
        return PlaceUpsertCommand.builder()
                .source(PlaceUpsertCommand.SOURCE_KAKAO)
                .sourceId("K1")
                .placeName("웰니스 장소")
                .wellnessContentId("W1")
                .x(127.0)
                .y(37.5)
                .build();
    }
}
