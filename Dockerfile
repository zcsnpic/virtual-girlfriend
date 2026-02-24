FROM nginx:alpine

# 复制项目文件到Nginx的默认目录
COPY . /usr/share/nginx/html/

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
