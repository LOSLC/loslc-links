
# syntax=docker/dockerfile:1.6   # enables BuildKit cache mounts

FROM astral/uv:python3.12-bookworm-slim AS runner


RUN useradd -m runner
USER runner
WORKDIR /home/runner/app
COPY --chown=runner:runner . .
RUN uv sync

EXPOSE 8000
CMD ["bash", "./entry.bash"]
