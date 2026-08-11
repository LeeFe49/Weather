package com.leefe.weather.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDiary {

    Long diaryId;
    String text;
}
