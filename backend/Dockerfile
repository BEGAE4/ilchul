FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY gradlew .
COPY gradle gradle

COPY build.gradle .
COPY settings.gradle .

RUN chmod +x ./gradlew

RUN ./gradlew dependencies --no-daemon

COPY src ./src

RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jdk-alpine 

# wget 설치 (헬스체크용)
RUN apk add --no-cache wget tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

RUN chown spring:spring app.jar

USER spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

ENTRYPOINT [ "java", "-jar", "/app/app.jar" ]