FROM node:latest

WORKDIR /app/execution
COPY restful /app

CMD [ "bash", "-c", " \
sh /app/bootstrap.sh; \
#sh /app/case.sh; \
"]