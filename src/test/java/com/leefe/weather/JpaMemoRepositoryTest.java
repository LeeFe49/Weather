package com.leefe.weather;

import com.leefe.weather.domain.Diary;
import com.leefe.weather.domain.Memo;
import com.leefe.weather.dto.request.CreateDiary;
import com.leefe.weather.repository.JpaMemoRepository;
import com.leefe.weather.service.DiaryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
public class JpaMemoRepositoryTest {

    @Autowired
    JpaMemoRepository jpaMemoRepository;

    @Autowired
    DiaryService diaryService;

    @Test
    void insertMemoTest() {
        //given
        Memo newMemo = new Memo();
        newMemo.setText("test");

        //when
        jpaMemoRepository.save(newMemo);

        //then
        List<Memo> memoList = jpaMemoRepository.findAll();
        assertTrue(memoList.size() > 0);
    }

    @Test
    void findByIdTest() {
        //given
        Memo newMemo = new Memo();
        newMemo.setText("this is jpa memo");

        //when
        Memo memo = jpaMemoRepository.save(newMemo);
        System.out.println(memo.getId());

        //then
        Optional<Memo> result = jpaMemoRepository.findById(memo.getId());
        assertEquals(result.get().getText(), newMemo.getText());
    }

    @Test
    void createDiary2TextTest() {
        Diary newDiary = new Diary();
        CreateDiary createDiary = new CreateDiary();
        createDiary.setCityName("naju");
        createDiary.setText("test");

        diaryService.createDiary2(LocalDate.parse("2026-08-03"), createDiary);

    }
}
