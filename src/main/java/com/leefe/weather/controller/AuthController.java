package com.leefe.weather.controller;

import com.leefe.weather.domain.Member;
import com.leefe.weather.dto.Auth;
import com.leefe.weather.dto.MemberResponse;
import com.leefe.weather.security.TokenProvider;
import com.leefe.weather.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final TokenProvider tokenProvider;

    @PostMapping("/signup") // 회원가입
    public ResponseEntity<MemberResponse> signup(@RequestBody Auth.SignUp request) {
        var result = this.memberService.register(request);
        return ResponseEntity.ok(MemberResponse.from(result));
    }

    @PostMapping(value = "/signin", produces = MediaType.TEXT_PLAIN_VALUE)  // 로그인, Content_type: text/plain
    public ResponseEntity<String> signin(@RequestBody Auth.SignIn request) {
        var member = this.memberService.authenticate(request);  // 입력한 비밀번호 인코딩하여 DB의 username의 비밀번호와 검증
        var token = this.tokenProvider.generateToken(member.getUsername(), member.getRoles()); // 토큰 생성
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<MemberResponse> me(@AuthenticationPrincipal Member member) { // Spring Security를 통해 현재 로그인한 사용자의 인증정보(해더의 토큰)를 MemberResponse로 반환
        if (member == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(MemberResponse.from(member));
    }

    @PostMapping("/update")
    public ResponseEntity<MemberResponse> update(@AuthenticationPrincipal Member member,
                                                 @RequestBody Auth.UpdateArea request) {
        if (member == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var result = memberService.updateMember(member.getId(), request.getAreaId());
        return ResponseEntity.ok(MemberResponse.from(result));
    }

}
