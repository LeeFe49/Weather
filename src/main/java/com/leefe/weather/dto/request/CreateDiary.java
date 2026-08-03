package com.leefe.weather.dto.request;

import com.leefe.weather.domain.Area;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDiary {

    private String cityName;
    private String text;
}
