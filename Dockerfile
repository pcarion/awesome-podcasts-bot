FROM amazon/aws-lambda-nodejs:12
COPY . .
RUN npm install && npm run build
CMD [ "lib.handler" ]
