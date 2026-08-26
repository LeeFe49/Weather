package com.leefe.weather.service;

import com.leefe.weather.dto.request.GeminiRequest;
import com.leefe.weather.dto.request.GeminiResponse;
import lombok.RequiredArgsConstructor;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.key}")
    private String apiKey;

    public String generate(String message) {

        RestClient restClient = RestClient.create();

        GeminiRequest requestBody = GeminiRequest.builder()
                .model("gemini-3.6-flash")
                .system_instruction("너는 날씨일기앱에서 사용자의 하루를 들어주고 위로해주는 대화형 AI야. 딱딱하지 않고 다정한 존댓말로 대답해. 답변은 한 두 문장정도로 작성해. 좋은 명언을 명언을 말한사람과 함께 섞어서 마지막에 \\\"누구 - 이 또한 지나가리라.\\\" 이런 포멧으로 써워. 다만 없는 명언은 만들지 말고. 사용자가 말하지 않은 사실은 만들어내지 마. API로 호출해서 내 어플에 사용해야하니까 앞에 위로문장의 앞뒤구분좌를 <text>, 마지막에 명언 부분의 구분좌를 <lang> 으로 해줘")
                .input(message)
                .build();

        return restClient.post()
                .uri("https://generativelanguage.googleapis.com/v1beta/interactions")
                .header("Content-Type", "application/json")
                .header("x-goog-api-key",apiKey)
                .body(requestBody)
                .retrieve()
                .body(String.class);
    }

    private String parseGemini(String jsonString) {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject;

        try {
            jsonObject = (JSONObject) jsonParser.parse(jsonString);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        HashMap<String, String> resultMap = new HashMap<>();

        JSONArray steps = (JSONArray) jsonObject.get("steps");
        JSONObject step = (JSONObject) steps.get(1);
        JSONArray contents = (JSONArray) step.get("content");
        JSONObject content = (JSONObject) contents.get(0);

        String result = (String) content.get("text");;

        return result;
    }

    public GeminiResponse callGemini(Long id, String text) {

        String jsonString = generate(text);

        String geminiText = parseGemini(jsonString);

        int textStart = geminiText.indexOf("<text>") + "<text>".length();
        int textEnd = geminiText.indexOf("</text>");

        String textOut = geminiText.substring(textStart, textEnd);

        int langStart = geminiText.indexOf("<lang>") + "<lang>".length();
        int langEnd = geminiText.indexOf("</lang>");

        String lang = geminiText.substring(langStart, langEnd);

        return GeminiResponse.builder()
                .text(textOut)
                .lang(lang)
                .build();
    }
}
