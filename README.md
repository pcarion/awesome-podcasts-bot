# awesome-podcasts-bot

Create a docker image for a lambda function:
https://docs.aws.amazon.com/lambda/latest/dg/getting-started-create-function.html#gettingstarted-images-function
https://aws.amazon.com/blogs/aws/new-for-aws-lambda-container-image-support/

```
aws ecr create-repository --repository-name awesome-podcasts-bot
docker tag  awesome-podcasts-bot:latest ${ECR_REPOSITORY_URL}:latest

$ aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REPOSITORY_URL
Login Succeeded

$ docker push ${ECR_REPOSITORY_URL}:latest
```



