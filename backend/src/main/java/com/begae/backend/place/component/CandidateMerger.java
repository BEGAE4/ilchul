package com.begae.backend.place.component;

import com.begae.backend.place.dto.PlaceCandidate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 웰니스 후보를 앞에, 카카오 후보를 뒤에 놓고 카카오 place id로 중복을 제거한다.
 *
 * 순서가 곧 AI에게 제시되는 순서이고, 웰니스를 앞에 두는 것이 우선 편입의 실체다.
 */
@Component
public class CandidateMerger {

    public List<PlaceCandidate> merge(List<PlaceCandidate> wellness, List<PlaceCandidate> kakao) {
        List<PlaceCandidate> merged = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (PlaceCandidate c : wellness) {
            if (c.getKakaoId() != null && seen.add(c.getKakaoId())) merged.add(c);
        }
        for (PlaceCandidate c : kakao) {
            if (c.getKakaoId() != null && seen.add(c.getKakaoId())) merged.add(c);
        }
        return merged;
    }
}
