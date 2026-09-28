# ---- build ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Small VMs (e.g. 1GB RAM): limit Gradle memory and show plain progress in build logs
ENV GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=256m -Dorg.gradle.workers.max=2"

COPY gradlew gradlew.bat ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
COPY src ./src

RUN chmod +x gradlew \
    && ./gradlew bootJar -x test --no-daemon --console=plain

# ---- run ----
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
