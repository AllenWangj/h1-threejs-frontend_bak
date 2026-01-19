FROM registry.cn-hangzhou.aliyuncs.com/maxtan-frontend/node:22.20.0 as builder

RUN npm config set registry https://registry.npmmirror.com
 
COPY ./ /workspace/

WORKDIR /workspace

RUN pnpm install --frozen-lockfile

RUN pnpm build:test

FROM registry.cn-hangzhou.aliyuncs.com/maxtan-frontend/nginx:1.29.1

COPY deploy/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /workspace/.output /var/lib/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]