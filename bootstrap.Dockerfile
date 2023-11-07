FROM node:latest

WORKDIR /app/execution
COPY ./heimdalljs/test/restful/bootstrap-scripts /app/bootstrap-scripts
COPY ./heimdalljs/test/restful/case-scripts /app/case-scripts
COPY ./heimdalljs/test/restful/restful-run.sh /app/restful-run.sh

CMD ["sh","/app/restful-run.sh"]