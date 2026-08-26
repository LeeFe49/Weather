package com.leefe.weather.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String weather;
    private String icon;
    private double temperature;
    private String text;
    private LocalDate date;
    private Long areaId = 1835848L;
    private String geminiText;
    private String geminiQuote;
    private Long memberId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
