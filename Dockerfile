FROM amazon/aws-lambda-nodejs:12
COPY . .
RUN npm install && npm run dist
CMD [ "dist/index.handler" ]
