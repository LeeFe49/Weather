package com.leefe.weather.service;

import com.leefe.weather.WeatherApplication;
import com.leefe.weather.domain.Diary;
import com.leefe.weather.dto.request.CreateDiary;
import com.leefe.weather.dto.request.GeminiResponse;
import com.leefe.weather.dto.request.UpdateDiary;
import com.leefe.weather.repository.AreaRepository;
import com.leefe.weather.repository.DiaryRepository;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DiaryService {

    @Value("${openweathermap.key}")
    private String apiKey;

    private final DiaryRepository diaryRepository;
    private final AreaRepository areaRepository;

    public DiaryService(DiaryRepository diaryRepository,  AreaRepository areaRepository) {
        this.diaryRepository = diaryRepository;
        this.areaRepository = areaRepository;
    }

    private static final Logger logger = LoggerFactory.getLogger(WeatherApplication.class);

    public void createDiary(Long memberId, LocalDate date, CreateDiary createDiary) {
        logger.info("started to create diary");
        // open weather map에서 날씨 데이터 가져오기
        String weatherData = getWeatherStringByCity(createDiary.getCityName());

        // 받아온 날씨 json 파싱하기
        Map<String, Object> parsedWeather = parseWeather(weatherData);

        // 파싱된 데이터 + 일기 값 우리 db에 넣기
        Diary nowDiary = new Diary();
        nowDiary.setWeather(parsedWeather.get("main").toString());
        nowDiary.setIcon(parsedWeather.get("icon").toString());
        nowDiary.setTemperature((Double)parsedWeather.get("temp"));
        nowDiary.setText(createDiary.getText());
        nowDiary.setDate(date);
        nowDiary.setMemberId(memberId);
        nowDiary.setCreatedAt(LocalDateTime.now());
        nowDiary.setUpdatedAt(LocalDateTime.now());
        nowDiary.setGeminiText(createDiary.getGeminiText());
        nowDiary.setGeminiQuote(createDiary.getGeminiQuote());

        Long AreaId = areaRepository.getAreaByName(createDiary.getCityName()).getId();

        nowDiary.setAreaId(AreaId);

        diaryRepository.save(nowDiary);
        logger.info("end to create diary");
    }

    public List<Diary> readDiary(Long memberId, LocalDate date) {
        logger.debug("read diary");
        return diaryRepository.findAllByMemberIdAndDate(memberId, date);
    }

    public void updateDiary(LocalDate date, UpdateDiary updateDiary) {
        Diary nowDiary = diaryRepository.findDiaryById(updateDiary.getDiaryId());
        nowDiary.setText(updateDiary.getText());
        nowDiary.setUpdatedAt(LocalDateTime.now());
        nowDiary.setGeminiText(updateDiary.getGeminiText());
        nowDiary.setGeminiQuote(updateDiary.getGeminiQuote());
        diaryRepository.save(nowDiary);
    }

    public void deleteDiary(LocalDate date) {
        diaryRepository.deleteAllByDate(date);
    }

    public List<Diary> readDiaries(Long memberId, LocalDate startDate, LocalDate endDate) {
        return diaryRepository.findAllByMemberIdAndDateBetweenOrderByDateDesc(memberId, startDate, endDate);
    }

    private String getWeatherStringByCity(String city) {
        String apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

        try {
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            int responseCode = connection.getResponseCode();
            BufferedReader br;
            if (responseCode == 200) {
                br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            } else {
                br = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
            }
            String inputLine;
            StringBuilder response = new StringBuilder();
            while((inputLine = br.readLine()) != null) {
                response.append(inputLine);
            }
            br.close();

            return response.toString();
        } catch (Exception e) {
            return "failed to get response";
        }
    }

    private HashMap<String, Object> parseWeather(String jsonString) {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject;

        try {
            jsonObject = (JSONObject) jsonParser.parse(jsonString);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        HashMap<String, Object> resultMap = new HashMap<>();

        JSONObject mainData = (JSONObject) jsonObject.get("main");
        resultMap.put("temp", mainData.get("temp"));
        JSONArray weatherArray = (JSONArray) jsonObject.get("weather");
        JSONObject weatherData = (JSONObject) weatherArray.get(0);
        resultMap.put("main", weatherData.get("main"));
        resultMap.put("icon", weatherData.get("icon"));
        return resultMap;
    }

}
