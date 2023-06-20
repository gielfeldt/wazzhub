FROM node:16.20.0 AS build

WORKDIR /build
COPY src /build/src
COPY assets-src /build/assets-src
COPY package* /build/
COPY framework7.json /build/
COPY .babelrc /build/

RUN npm install
RUN npm run build

FROM m3ng9i/ran AS prod

COPY --from=build /build/dist /web
