package com.leefe.weather;

import com.leefe.weather.domain.Memo;
import com.leefe.weather.repository.JdbcMemoRepository;
import com.leefe.weather.service.GeminiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional
public class JdbcMemoRepositoryTest {

    @Autowired
    JdbcMemoRepository jdbcMemoRepository;

    @Autowired
    GeminiService geminiService;


    @Test
    void insertMemoTest() {

        Memo newMemo = new Memo(1, "this is new Memo~");
        jdbcMemoRepository.save(newMemo);
    }

    @Test
    void insertMemoTest2() {

        //given
        Memo newMemo = new Memo(1, "this is new memo");

        //when
        jdbcMemoRepository.save(newMemo);

        //then
        Optional<Memo> result = jdbcMemoRepository.findById(1);
        assertEquals(result.get().getText(), "this is new memo");
    }

    @Test
    void findAllMemoTest() {
        List<Memo> memoList = jdbcMemoRepository.findAll();
        System.out.println(memoList);
        assertNotNull(memoList);
    }

    @Test
    void geminiTest1() {
        System.out.println(geminiService.generate("오늘 맛잇는 점심을 먹었다"));
    }

    @Test
    void geminiTest2() {
        System.out.println(geminiService.callGemini(1L,"오늘 맛잇는 점심을 먹었다"));
    }
}
