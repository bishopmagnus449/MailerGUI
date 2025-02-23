#!/bin/bash

set -e

if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl git
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update

  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

if ! sysctl -n vm.overcommit_memory | grep -q '1'; then
  sudo sysctl vm.overcommit_memory=1
  echo "vm.overcommit_memory=1" | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
fi

if [ -d "MailerGUI" ]; then
  cd MailerGUI || exit 1
  git pull
else
  git clone https://github.com/bishopmagnus449/MailerGUI && cd MailerGUI || exit 1
fi

clear

sudo docker compose up --build
