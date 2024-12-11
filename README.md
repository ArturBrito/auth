# generate RS256 keys:
ssh-keygen -t rsa -b 4096 -m PEM -f rs256.rsa
# Don't add passphrase
openssl rsa -in rs256.rsa -pubout -outform PEM -out rs256.rsa.pub

# Run docker-compose files
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.prod.yml up --build
