package com.leefe.weather.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Area {

    @Id
    private Long id;
    private String name;
    private Double lat;
    private Double lon;

    @Column
    private String text = "";
}
