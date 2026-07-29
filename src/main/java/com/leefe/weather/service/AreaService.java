package com.leefe.weather.service;

import com.leefe.weather.domain.Area;
import com.leefe.weather.repository.AreaRepository;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    public List<Area> readAreas() {
        return areaRepository.findAll();
    }

    public Area readArea(String area) {
        return areaRepository.getAreaByName(area);
    }

    public Area updateArea(String area, String text) {
        Area nowArea = areaRepository.getAreaByName(area);
        nowArea.setText(text);
        return areaRepository.save(nowArea);
    }

    public List<Area> findAreas() throws IOException {

        List<Area>  areaList = new ArrayList<>();

        try {
            String jsonString = readJsonFile();

            JSONParser parser = new JSONParser();
            JSONArray jsonArray = (JSONArray) parser.parse(jsonString);

            for (Object obj : jsonArray) {
                JSONObject item = (JSONObject) obj;
                JSONObject city = (JSONObject) item.get("city");
//                JSONObject id = (JSONObject) city.get("id");
                JSONObject coord = (JSONObject) city.get("coord");

                Area area = new Area();

                area.setId((Long) getLongValue(item.get("id")));
                area.setName((String) city.get("name"));
                area.setLat(getDoubleValue(coord.get("lat")).doubleValue());
                area.setLon(getDoubleValue(coord.get("lon")).doubleValue());

                areaList.add(area);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return areaList;
    }

    public List<Area> updateAreas() throws IOException {
        List<Area> areaList = findAreas();
        areaRepository.saveAll(areaList);
        return areaList;
    }

    public List<Area> readAreasUpdated() {
        return areaRepository.findByTextNot("");
    }

    public List<Area> readAreasLike(String name) {
        return areaRepository.findByNameContaining(name);
    }

    private Number getDoubleValue(Object value) {

        if (value instanceof JSONObject obj) {

            if (obj.containsKey("$numberLong")) {
                return Long.parseLong(
                        obj.get("$numberLong").toString()
                );
            }
        }

        if (value instanceof Number) {
            return (Number) value;
        }

        return null;
    }

    private Long getLongValue(Object value) {

        if (value instanceof JSONObject obj) {

            if (obj.containsKey("$numberLong")) {
                return Long.parseLong(
                        obj.get("$numberLong").toString()
                );
            }
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return null;
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
