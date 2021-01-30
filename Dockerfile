FROM amazon/aws-lambda-nodejs:12 AS stage1
COPY . /app/
WORKDIR /app
RUN npm install && npm run dist

FROM amazon/aws-lambda-nodejs:12
COPY --from=stage1 /app/dist /app/dist/
COPY ./certs/*.pem /app/certs/
WORKDIR /app
CMD [ "/app/dist/index.handler" ]
