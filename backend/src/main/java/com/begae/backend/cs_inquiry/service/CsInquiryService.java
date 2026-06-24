package com.begae.backend.cs_inquiry.service;

import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.*;
import com.begae.backend.cs_inquiry.enums.InquiryType;

public interface CsInquiryService {
    CreateCsInquiryResponseDto createCsInquiry(Integer userId, CreateCsInquiryRequestDto requestDto);

    UpdateCsInquiryResponseDto updateCsInquiry(Integer userId, Integer inquiryId, UpdateCsInquiryRequestDto requestDto);

    void deleteCsInquiry(Integer userId, Integer inquiryId);

    AdminCsInquiryListResponseDto getCsInquiries(InquiryType category, String search, int size, Integer lastInquiryId);

    ReplyCsInquiryResponseDto replyToCsInquiry(Integer inquiryId, ReplyCsInquiryRequestDto requestDto);

    InquiryTypeListResponseDto getInquiryTypes();

    UserCsInquiryListResponseDto getUserCsInquiry(Integer userId, int size, Integer lastInquiryId);

    void closeCsInquiry(Integer userId, Integer inquiryId);
}





