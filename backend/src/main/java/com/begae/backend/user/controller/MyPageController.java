package com.begae.backend.user.controller;

import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserNicknameRequest;
import com.begae.backend.user.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @PatchMapping("/nickname")
    public ResponseEntity<Boolean> setUserNickname(UpdateUserNicknameRequest updateUserNicknameRequest) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(myPageService.updateUserNickname(updateUserNicknameRequest));
    }

    @GetMapping("plans")
    public ResponseEntity<MyPlansResponse> getMyPlans() {
        MyPlansResponse myPlansResponse = myPageService.findMyPlans();
        if(myPlansResponse.getPlans().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(myPlansResponse);
    }

    @PostMapping("/plan/visibility/{planId}")
    public ResponseEntity<Void> setUserMyPlanVisibility(@PathVariable(name = "planId") Integer planId) {
        if(!myPageService.updateMyPlanVisibility(planId)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
