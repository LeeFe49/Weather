package com.leefe.weather.service;

import com.leefe.weather.domain.Area;
import com.leefe.weather.domain.Diary;
import com.leefe.weather.repository.AreaRepository;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    public Area createArea(String findAreaString, String saveAreaString) {
        Area newArea = new Area();
        Area dbArea = new Area();
        dbArea = areaRepository.getAreaByArea(saveAreaString);

        newArea = findArea(findAreaString);

        dbArea.setLon(newArea.getLon());
        dbArea.setLat(newArea.getLat());
        dbArea.setName(findAreaString);

        areaRepository.save(dbArea);

        return dbArea;
    }

    public List<Area> readAreas() {
        return areaRepository.findAll();
    }

    public Area readArea(String area) {
        return areaRepository.getAreaByArea(area);
    }

    public Area updateArea(String area, Double lat, Double lon) {
        Area nowArea = areaRepository.getAreaByArea(area);
        nowArea.setLat(lat);
        nowArea.setLon(lon);
        return areaRepository.save(nowArea);
    }

    public Area findArea(String area) {
        HashMap<String, Object> city = findCity(area);
        Area newArea = new Area();
        newArea.setArea(city.get("name").toString());
        newArea.setLon(Double.parseDouble(city.get("lon").toString()));
        newArea.setLat(Double.parseDouble(city.get("lat").toString()));

        return newArea;
    }

    private String readJsonFile() throws IOException {
        ClassPathResource resource = new ClassPathResource("history.city.list.json");

        return new String(
                resource.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        );
    }

    private HashMap<String, Object> findCity(String cityName) {
        try {
            String jsonString = readJsonFile();

            JSONParser parser = new JSONParser();
            JSONArray jsonArray = (JSONArray) parser.parse(jsonString);

            for (Object obj : jsonArray) {
                JSONObject item = (JSONObject) obj;
                JSONObject city = (JSONObject) item.get("city");

                if (cityName.equalsIgnoreCase((String) city.get("name"))) {

                    HashMap<String, Object> result = new HashMap<>();

                    result.put("id", item.get("id"));
                    result.put("name", city.get("name"));
                    result.put("country", city.get("country"));

                    JSONObject coord = (JSONObject) city.get("coord");
                    result.put("lon", coord.get("lon"));
                    result.put("lat", coord.get("lat"));

                    return result;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
