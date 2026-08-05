package com.leefe.weather.service;

import com.leefe.weather.domain.Member;
import com.leefe.weather.dto.Auth;
import com.leefe.weather.repository.MemberRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MemberService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return this.memberRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("couldn't find user -> " + username));
    }

    public Member register(Auth.SignUp member) {
        boolean exists = this.memberRepository.existsByUsername(member.getUsername());
        if (exists) {
            throw new RuntimeException("이미 사용 중인 아이디 입니다");
        }

        member.setPassword(passwordEncoder.encode(member.getPassword()));

        return this.memberRepository.save(member.toEntity());
    }

    public Member authenticate(Auth.SignIn memebr) {

        var member = this.memberRepository.findByUsername(memebr.getUsername())
                            .orElseThrow(() -> new RuntimeException("존재하지 않는 ID 입니다"));

        if (!this.passwordEncoder.matches(memebr.getPassword(), member.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다");
        }

        return member;
    }
}
