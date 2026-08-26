package com.leefe.weather.repository;

import com.leefe.weather.domain.Diary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Integer> {
    List<Diary> findAllByDate(LocalDate date);

    List<Diary> findAllByMemberIdAndDate(Long memberId, LocalDate date);

    List<Diary> findAllByMemberIdAndDateBetweenOrderByDateDesc(Long memberId, LocalDate startDate, LocalDate endDate);

    Diary getFirstByDate(LocalDate date);

    Diary findDiaryById(Long id);

    @Transactional
    void deleteAllByDate(LocalDate date);
}
