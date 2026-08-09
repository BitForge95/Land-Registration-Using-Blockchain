#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
export PATH="$SCRIPT_DIR/bin:$PATH"

printHelp() {
  echo "Usage:"
  echo "  $0                   - Start the network (default: equivalent to 'up')"
  echo "  $0 up [createChannel ...]  - Start the network (and optionally request channel creation)"
  echo "  $0 down              - Stop and remove the network containers"
  echo
  echo "Notes:"
  echo "  - 'createChannel' is accepted for compatibility with the README but is not"
  echo "    fully implemented in this simplified script."
}

networkUp() {
  if [ ! -d "crypto-config" ]; then
    echo "Generating crypto material..."
    cryptogen generate --config=./crypto-config.yaml --output=crypto-config
  fi

  export FABRIC_CFG_PATH="$SCRIPT_DIR"

  if [ ! -f "genesis.block" ]; then
    echo "Creating genesis block..."
    configtxgen \
      -profile Genesis \
      -channelID system-channel \
      -outputBlock ./genesis.block
  fi

  echo "Starting Fabric containers..."
  docker compose up -d

  echo "Network started successfully!"
  docker ps
}

networkDown() {
  echo "Stopping Fabric containers..."
  docker compose down
  echo "Network stopped."
}

# ---------------------------------------------------------------------------
# CLI argument parsing
# ---------------------------------------------------------------------------

COMMAND="${1:-up}"
SUBCOMMAND="$2"

case "$COMMAND" in
  up)
    networkUp
    if [ "$SUBCOMMAND" = "createChannel" ]; then
      shift 2 || true
      echo "NOTE: 'createChannel' was requested, but channel creation is not"
      echo "      implemented in this simplified network.sh script."
      echo "      The network has been started; please use the appropriate"
      echo "      Fabric tooling or scripts to create channels."
    fi
    ;;
  down)
    networkDown
    ;;
  -h|--help|help)
    printHelp
    ;;
  *)
    echo "Unknown command: '$COMMAND'"
    echo
    printHelp
    exit 1
    ;;
esac