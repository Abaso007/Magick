# This file is generated by Nx.
#
# Build the docker image with `npx nx docker-build agent-connector`.
# Tip: Modify "docker-build" options in project.json to change docker build args.
#
# Run the container with `docker run -p 3000:3000 -t agent-connector`.
FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system agent-connector && \
          adduser --system -G agent-connector agent-connector

COPY . .
RUN chown -R agent-connector:agent-connector .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
# RUN npm --prefix agent-connector --omit=dev -f install
RUN npm install -g nx -y
RUN npm install --ignore-scripts

CMD [ "npx", "nx", "run", "agent-connector:serve:production", "--skip-nx-cache" ]


