# 날씨일기
날씨일기를 작성하는 웹 애플리케이션입니다.

#### http://161.33.23.177:8080

  
## 🖥️ 프로젝트 소개
개인 일기와 포트폴리오를 관리하기 위해 개발하고 있습니다.


## 📌 주요 기능
- 회원가입/로그인
- 일기작성
- 지역 날씨 정보
- 위로한마디 (명언)

  
## 🕰️ 개발 기간
* 26.07.20일 ~~


### ⚙️ 개발 환경
- **Language** : Java 17
- **Framework** : Springboot (4.1.0)
- **Database** : MySQL - TailScale
- **ORM** : JPA
- **Frontend**: Thymeleaf
- **Build**: Gradle
- **날씨정보**: openweathermap
- **일기위로(명언)**: gemini-3.6-flash

### 🖥️ 서버 환경
- oracle cloud server
- JDK 17

  
## ❗️ 시작하기
이 섹션에서는 프로젝트를 로컬에서 설정하고 실행하는 방법을 설명합니다.

  
## 🌐 배포 방법
#### ROOT.war
#### ps -ef | grep java
#### kill {pid}
#### git branch : 현재 브랜치 확인
#### git fetch
#### git pull origin main
#### ./gradlew clean : 기존 빌드 삭제
#### ./gradlew build -x test : 테스트없이 jar 빌드
#### nohup java -jar {prj}.jar & : 백그라운드로 jar 실행


#### 위로 한마디
- gemini-3.6-flash


#### ERD


#### 추가기능 (예정)
- 사용자 계정
- 실시간 많이 듣는 노래 틀기
- AI 대화형 일기 -> 음성인식 : ai 응담, 요청 테이블 생성 : 멀티턴으로 응답 요청
- Docker
- Jenkins
- 배포
- DB서버 다운 오류 개선
- 소셜 로그인
서버셋팅 출처:
#### https://vennycode.tistory.com/54
#### https://korea-potato.tistory.com/39#google_vignette
#### https://newstroyblog.tistory.com/652
