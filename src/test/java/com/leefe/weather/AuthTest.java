package com.leefe.weather;

import com.leefe.weather.domain.Member;
import com.leefe.weather.repository.MemberRepository;
import com.leefe.weather.service.MemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
public class AuthTest {

    @Autowired
    MemberRepository memberRepository;
    @Autowired
    private MemberService memberService;

    @Test
    void test() {
        Member member = memberRepository.findMemberById(2L);

        System.out.println(member);

        member = memberService.updateMember(member.getId(), 123L);

        System.out.println(member);
        return;
    }


}
