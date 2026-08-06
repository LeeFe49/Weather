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

    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@RequestBody Auth.SignUp request) {
        var result = this.memberService.register(request);
        return ResponseEntity.ok(MemberResponse.from(result));
    }

    @PostMapping(value = "/signin", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> signin(@RequestBody Auth.SignIn request) {
        var member = this.memberService.authenticate(request);
        var token = this.tokenProvider.generateToken(member.getUsername(), member.getRoles());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<MemberResponse> me(@AuthenticationPrincipal Member member) {
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
