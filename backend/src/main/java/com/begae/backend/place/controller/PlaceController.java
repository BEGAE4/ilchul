package com.begae.backend.place.controller;

import com.begae.backend.place.dto.PlaceSummaryDto;
import com.begae.backend.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping("/list")
    public ResponseEntity<List<PlaceSummaryDto>> getPlace(@RequestParam String keyword) {
        try {
            log.info("api request : {}", keyword);
            List<PlaceSummaryDto> places = placeService.searchPlace(keyword);
            return ResponseEntity.ok().body(places);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

}

