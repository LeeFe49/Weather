package com.leefe.weather.controller;

import com.leefe.weather.domain.Diary;
import com.leefe.weather.domain.Member;
import com.leefe.weather.dto.request.CreateDiary;
import com.leefe.weather.dto.request.UpdateDiary;
import com.leefe.weather.service.DiaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class DiaryController {
    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @PostMapping("/create/diary")  // 지역칼럼 추가하여 저장
    void createDiary(@AuthenticationPrincipal Member member
            ,@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
            , @RequestBody CreateDiary createDiary) {
        diaryService.createDiary(member.getId(), date, createDiary);
    }

    @GetMapping("/read/diary")
    List<Diary> readDiary(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return diaryService.readDiary(date);
    }

    @GetMapping("/read/diaries")
    List<Diary> readDiaries(@AuthenticationPrincipal Member member
            , @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate
            , @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return diaryService.readDiaries(member.getId(), startDate, endDate);
    }

    @PutMapping("/update/diary2")
    void updateDiary2(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, @RequestBody UpdateDiary updateDiary) {
        diaryService.updateDiary(date, updateDiary);
    }

    @DeleteMapping("/delete/diary")
    void deleteDiary(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        diaryService.deleteDiary(date);
    }

}
