FROM mcr.microsoft.com/vscode/devcontainers/base:bookworm

ARG MISE_VERSION="v2025.9.2"

RUN curl https://mise.run | MISE_VERSION=$MISE_VERSION MISE_INSTALL_PATH=/usr/local/bin/mise sh

USER vscode
RUN echo 'eval "$(mise activate bash)"' >> ~/.bashrc
RUN echo 'eval "$(mise completion bash --include-bash-completion-lib)"'  >> ~/.bashrc
