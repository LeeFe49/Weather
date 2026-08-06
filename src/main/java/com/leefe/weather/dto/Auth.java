package com.leefe.weather.dto;

import com.leefe.weather.domain.Member;
import lombok.Data;

import java.util.List;

public class Auth {

    @Data
    public static class SignIn {
        private String username;
        private String password;
    }

    @Data
    public static class SignUp {
        private String username;
        private String password;
        private Long areaId;
        private List<String> roles;

        public Member toEntity() {
            return Member.builder()
                    .username(this.username)
                    .password(this.password)
                    .areaId(this.areaId)
                    .roles(this.roles)
                    .build();
        }
    }

    @Data
    public static class UpdateArea {
        private Long areaId;
    }
}
