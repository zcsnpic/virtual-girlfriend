FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install --prefix server

EXPOSE 8000 3000

RUN cp server/.env.example server/.env

# 创建启动脚本
RUN echo -e "#!/bin/sh\npython3 -m http.server 8000 &\ncd server && npm start" > start.sh && chmod +x start.sh

CMD ["./start.sh"]
