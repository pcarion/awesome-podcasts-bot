set -e
npm run build
docker build -t awesome-podcasts-bot .
