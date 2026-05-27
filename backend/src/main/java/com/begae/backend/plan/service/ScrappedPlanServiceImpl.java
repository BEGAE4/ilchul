package com.begae.backend.plan.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.dto.ScrappedPlanCreateResponseDto;
import com.begae.backend.plan.dto.ScrappedPlanResponseDto;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScrappedPlanServiceImpl implements ScrappedPlanService {

    private final ScrappedPlanRepository scrappedPlanRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    /**
     * 같은 plan을 여러번 누를경우 동시성 처리 생각하기
     *
     * @param userId
     * @param planId
     * @return
     */
    @Transactional
    @Override
    public ScrappedPlanCreateResponseDto createPlanScrapped(Integer userId, Integer planId) {
        // plan 찾아오기
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        scrappedPlanRepository.findByUser_UserIdAndPlan_PlanId(userId, planId)
                .ifPresentOrElse(
                        ScrappedPlan::toggle,
                        () -> {
                            ScrappedPlan newScrap = ScrappedPlan.of(user, plan);
                            plan.increaseScrappedCount();
                            scrappedPlanRepository.save(newScrap);
                        }
                );

        return ScrappedPlanCreateResponseDto.from(plan);
    }

    @Transactional(readOnly = true)
    @Override
    public ScrappedPlanResponseDto findUserScrappedPlan(Integer userId) {
        List<Integer> planIds = scrappedPlanRepository.findPlanIdsByUserId(userId);
        List<Plan> plans = planRepository.findByPlanIdIn(planIds);

        return ScrappedPlanResponseDto.from(plans);
    }

}
