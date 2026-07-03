FROM eclipse-temurin:21-jdk-alpine 

RUN apk add --no-cache wget tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

# 1. Pyroscope Java Agent 다운로드
ADD https://github.com/grafana/pyroscope-java/releases/download/v0.12.0/pyroscope.jar /app/pyroscope.jar

RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001

WORKDIR /app

COPY build/libs/*.jar app.jar

RUN chown spring:spring app.jar /app/pyroscope.jar

USER spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

ENTRYPOINT [ "sh", "-c", "java -javaagent:/app/pyroscope.jar -Dpyroscope.server.address=http://pyroscope:4040 -Dpyroscope.application.name=ilchul-backend -jar /app/app.jar" ]