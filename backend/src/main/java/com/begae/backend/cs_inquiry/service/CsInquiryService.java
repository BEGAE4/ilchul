package com.begae.backend.cs_inquiry.service;

import com.begae.backend.cs_inquiry.dto.request.CreateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.ReplyCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.request.UpdateCsInquiryRequestDto;
import com.begae.backend.cs_inquiry.dto.response.CsInquiryListResponseDto;
import com.begae.backend.cs_inquiry.dto.response.InquiryTypeListResponseDto;
import com.begae.backend.cs_inquiry.enums.InquiryType;

public interface CsInquiryService {
    Integer createCsInquiry(Integer userId, CreateCsInquiryRequestDto requestDto);

    Integer updateCsInquiry(Integer userId, Integer inquiryId, UpdateCsInquiryRequestDto requestDto);

    void deleteCsInquiry(Integer userId, Integer inquiryId);

    CsInquiryListResponseDto getCsInquiries(InquiryType category, String search, int size, Integer lastInquiryId);

    void replyToCsInquiry(Integer inquiryId, ReplyCsInquiryRequestDto requestDto);

    InquiryTypeListResponseDto getInquiryTypes();

    CsInquiryListResponseDto getUserCsInquiry(Integer userId, int size, Integer lastInquiryId);

    void closeCsInquiry(Integer userId, Integer inquiryId);
}




