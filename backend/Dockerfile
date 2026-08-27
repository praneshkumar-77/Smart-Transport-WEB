FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "if echo \"$SPRING_DATASOURCE_URL\" | grep -q '^postgres://'; then export SPRING_DATASOURCE_URL=$(echo \"$SPRING_DATASOURCE_URL\" | sed -e 's/^postgres:\\/\\/[^@]*@/jdbc:postgresql:\\/\\//'); elif [ -n \"$DB_HOST\" ]; then export SPRING_DATASOURCE_URL=\"jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME\"; fi && java -jar app.jar"]
