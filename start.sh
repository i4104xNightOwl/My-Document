# Xóa container và image cũ
docker rm -f my-docs
docker rmi my-document

# Build lại
docker build -t my-document .

# Chạy lại
docker run -d \
  --name my-docs \
  --restart always \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  my-docs-app

# Xem logs
docker logs my-docs