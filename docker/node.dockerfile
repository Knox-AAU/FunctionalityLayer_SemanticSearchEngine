FROM node
WORKDIR /app

#For btop
RUN wget -qO btop.tbz https://github.com/aristocratos/btop/releases/latest/download/btop-x86_64-linux-musl.tbz && tar xf btop.tbz --strip-components=2 -C /usr/local ./btop/bin/btop


RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

COPY ./.puppeteerrc.cjs ./
COPY ./package.json ./

USER root
RUN chown -R pptruser:pptruser /app/package.json \
    && chown -R pptruser:pptruser /app

USER pptruser
RUN npm i

USER root
RUN chown -R pptruser:pptruser /app

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

USER root
COPY "../" ./
RUN chown -R pptruser:pptruser /app
RUN mkdir -p /app/texts/pdfs
RUN mkdir -p /app/texts/strings
RUN chown -R pptruser:root /app/texts/

#ENV PORT=3000

#EXPOSE 3000

USER pptruser
CMD [ "npm", "run", "server" ]