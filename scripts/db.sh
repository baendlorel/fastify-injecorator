docker run --name test-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=testdb \
  -v auth-service-2025-mysql-data:/var/lib/mysql \
  -p 30895:3306 \
  -d mysql:9.3.0
