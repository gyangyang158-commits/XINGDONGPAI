FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8772
COPY package.json ./
COPY assets/ ./assets/
COPY scripts/ ./scripts/
COPY xingdongpai-room-optimized.html ./
RUN npm run build
USER node
EXPOSE 8772
CMD ["npm", "start"]
