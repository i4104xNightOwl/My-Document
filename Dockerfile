FROM node:20-alpine

WORKDIR /app

# Cài đặt các dependencies cần thiết
RUN apk add --no-cache \
    python3 \
    python3-dev \
    make \
    g++ \
    gcc \
    libc6-compat \
    build-base \
    sqlite \
    sqlite-dev

# Tạo thư mục và set quyền
RUN mkdir -p /app/node_modules && chown -R node:node /app/node_modules
RUN mkdir -p /app/data && chown -R node:node /app/data

# Copy package.json trước
COPY package*.json ./

# Install với node-gyp được cấu hình đúng
ENV PYTHON=/usr/bin/python3
ENV NODE_GYP_FORCE_PYTHON=/usr/bin/python3
RUN yarn install --frozen-lockfile --build-from-source

# Copy source code
COPY --chown=node:node . .

USER node

EXPOSE 3000

# Chạy với node trực tiếp thay vì qua yarn
CMD ["node", "app.js"] 