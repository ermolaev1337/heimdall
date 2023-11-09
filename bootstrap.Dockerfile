FROM node:latest

WORKDIR /app/execution
COPY restful/bootstrap-scripts /app/bootstrap-scripts
COPY restful/case-scripts /app/case-scripts
COPY restful/restful-run.sh /app/restful-run.sh

CMD ["sh","/app/restful-run.sh"]