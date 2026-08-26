package com.leefe.weather.dto.request;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class GeminiRequest {

    private String model;
    private String system_instruction;
    private String input;
}
