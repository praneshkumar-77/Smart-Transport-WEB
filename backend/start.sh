#!/bin/sh
set -e

# Extract URL from OS env variable and convert to JDBC if necessary
JDBC_URL=""

if echo "$SPRING_DATASOURCE_URL" | grep -q '^postgres://'; then
    # Strip user:pass@ and convert protocol
    JDBC_URL=$(echo "$SPRING_DATASOURCE_URL" | sed -E 's|^postgres://([^@]+@)?|jdbc:postgresql://|')
elif [ -n "$DB_HOST" ]; then
    # Fallback to blueprint manually injected variables
    JDBC_URL="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
fi

if [ -n "$JDBC_URL" ]; then
    echo "Starting application with dynamically converted PostgreSQL JDBC URL."
    # We must explicitly set this via property argument to ensure it completely bypasses any OS cache
    exec java -Dspring.datasource.url="$JDBC_URL" -jar app.jar
else
    echo "Starting application with default application.properties datasource."
    exec java -jar app.jar
fi
