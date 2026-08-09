# Blockchain Network Deployment Log

This document records every change made to the blockchain-network scripts, all bugs found,
the exact deployment sequence, and the handoff artifacts for the backend team.
It is intended for anyone who picks up where this deployment left off.

---

## 1. Environment

| Item | Value |
|------|-------|
| Host OS | Ubuntu Linux, kernel 6.17, x86_64 |
| Docker | v29.0.0 (system daemon at `/var/run/docker.sock`) |
| Docker Compose | v2.40.1 (plugin — use `docker compose`, NOT `docker-compose`) |
| Java | OpenJDK 21 (compatible with Fabric Java chaincode) |
| Fabric binaries | Pre-built x86_64 ELF in `blockchain-network/bin/` |

---

## 2. Bugs Found and Fixed

### Bug 1 — Fabric binaries not on PATH (`network.sh`)

**File:** `blockchain-network/network.sh`

Both `cryptogen` and `configtxgen` are in `blockchain-network/bin/`, but the original
script never added that directory to `PATH`. Running the script would immediately fail
with `command not found`.

**Fix applied:** Added `export PATH="$SCRIPT_DIR/bin:$PATH"` right after `cd "$SCRIPT_DIR"`.

```diff
 SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
 cd "$SCRIPT_DIR"
+export PATH="$SCRIPT_DIR/bin:$PATH"
```

---

### Bug 2 — `docker-compose` standalone ignores Docker context (`network.sh`)

**File:** `blockchain-network/network.sh`

The original script called `docker-compose` (the old standalone v1 binary at
`/usr/local/bin/docker-compose`). This binary reads its own Docker host configuration
and **does not** respect the `docker context use default` switch. It kept trying to connect
to the Docker Desktop socket (`~/.docker/desktop/docker.sock`), which was not running.

The Docker Compose v2 plugin (`docker compose`, built into the Docker CLI) correctly
uses the active Docker context.

**Fix applied:** Replaced both `docker-compose` calls with `docker compose`.

```diff
-  docker-compose up -d
+  docker compose up -d

-  docker-compose down
+  docker compose down
```

---

### Bug 3 — Fabric binaries not on PATH and no `FABRIC_CFG_PATH` (`deployChaincode.sh`)

**File:** `blockchain-network/deployChaincode.sh`

The original script had no `SCRIPT_DIR`, no `cd`, no PATH setup, and no `FABRIC_CFG_PATH`.
This caused two failures:
- `peer`, `configtxgen` — not found (same PATH issue as Bug 1)
- `peer` CLI — could not locate `core.yaml` without `FABRIC_CFG_PATH` pointing to
  `blockchain-network/config/` (where `core.yaml` lives)

**Fix applied:** Added the following block right after `set -e`:

```diff
+SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+cd "$SCRIPT_DIR"
+export PATH="$SCRIPT_DIR/bin:$PATH"
+export FABRIC_CFG_PATH="$SCRIPT_DIR/config"
+
 # --- Configuration Variables ---
```

---

### Bug 4 — `gradle-wrapper.jar` not committed to repo (`deployChaincode.sh`)

**File:** `chaincode/land-contract-java/gradle/wrapper/gradle-wrapper.jar`

The Gradle wrapper JAR is typically gitignored and was absent from the repo. `./gradlew`
immediately fails with `ClassNotFoundException: org.gradle.wrapper.GradleWrapperMain`
without it. The JAR is a tiny (~43 KB) bootstrapper that downloads the real Gradle
distribution on first run.

**Fix applied:** Downloaded the JAR from the Gradle GitHub release tag and placed it at:
`chaincode/land-contract-java/gradle/wrapper/gradle-wrapper.jar`

```bash
curl -L "https://github.com/gradle/gradle/raw/v8.5.0/gradle/wrapper/gradle-wrapper.jar" \
  -o chaincode/land-contract-java/gradle/wrapper/gradle-wrapper.jar
```

On first run after this fix, Gradle automatically downloads the `gradle-8.5-bin.zip`
distribution (~130 MB, cached in `~/.gradle/`). Subsequent runs are fast.

---

### Bug 5 — Channel creation not idempotent (`deployChaincode.sh`)

**File:** `blockchain-network/deployChaincode.sh`

If `deployChaincode.sh` was interrupted mid-run (e.g., during the Gradle build) and
re-run, the `peer channel create` step would fail because the channel already existed,
halting the script before chaincode installation.

**Fix applied:** Wrapped the entire channel-creation block in an existence check on
`landchannel.block`. If the block file already exists, the whole section is skipped.

```bash
if [ -f "./landchannel.block" ]; then
  echo "Step 0: channel already created. Skipping."
else
  # ... channel create + peer join ...
fi
```

---

## 3. Docker Access Setup (One-Time)

The system Docker daemon runs at `/var/run/docker.sock`. By default only the `docker`
group can access it. The `pixelknight` user was not in that group.

**Steps taken (run once as root):**

```bash
usermod -aG docker pixelknight
```

Then, in a **new** pixelknight terminal:

```bash
docker context use default   # switch away from Docker Desktop context
docker ps                    # verify connectivity
```

---

## 4. Deployment Sequence

Run both scripts from the `blockchain-network/` directory, in order.

### Step 1 — Start the Fabric network

```bash
cd blockchain-network
./network.sh up
```

What this does:
1. Runs `cryptogen generate --config=./crypto-config.yaml --output=crypto-config`
   — generates all TLS and identity material into `crypto-config/` (gitignored)
2. Runs `configtxgen -profile Genesis -channelID system-channel -outputBlock ./genesis.block`
   — creates the orderer system channel genesis block (gitignored)
3. `docker compose up -d` — starts 7 containers:
   - `couchdb0` (port 5984), `couchdb1` (port 7984)
   - `peer0.org1.landregistry.com` (port 7051)
   - `peer0.org2.landregistry.com` (port 9051)
   - `orderer0.landregistry.com` (port 7050)
   - `orderer1.landregistry.com` (port 8050)
   - `orderer2.landregistry.com` (port 9050)

### Step 2 — Deploy the chaincode

```bash
./deployChaincode.sh
```

What this does (in order):
1. Waits 10 s for Raft leader election
2. `configtxgen -profile LandChannel` — generates `landchannel.tx`
3. `peer channel create` — submits channel creation to orderer, receives `landchannel.block`
4. `peer channel join` for Org1 peer, then Org2 peer
5. `./gradlew clean build shadowJar` — builds chaincode fat-JAR (`chaincode.jar`)
6. `peer lifecycle chaincode package` — packages JAR into `landregistry.tar.gz`
7. `peer lifecycle chaincode install` on both Org1 and Org2 peers
8. `peer lifecycle chaincode approveformyorg` for Org1, then Org2
9. `peer lifecycle chaincode commit` — commits definition to `landchannel`
10. `peer chaincode invoke initLedger` — initializes the ledger (no-op, prints log line)

---

## 5. Deployed Network Config

| Parameter | Value |
|-----------|-------|
| Channel | `landchannel` |
| Chaincode name | `landregistry` |
| Chaincode version | `1.0` |
| Sequence | `1` |
| Package ID | `landregistry_1.0:162d53d8a5d787a1ebda335e8d3402e97ced6a0fb0e373c8ce952fbff3e4faee` |
| Org1 peer address | `localhost:7051` |
| Org2 peer address | `localhost:9051` |
| Orderer address | `localhost:7050` |
| MSP ID (Org1) | `Org1MSP` |
| MSP ID (Org2) | `Org2MSP` |
| TLS override authority | `peer0.org1.landregistry.com` |
| Deployment date | 2026-08-10 |
| `initLedger` result | `status:200` (success) |

---

## 6. Backend Team Handoff Artifacts

After the network is up, copy these three files for the backend team (they configure
`backend-api/src/main/resources/application.properties` or env vars):

```bash
# Signing certificate (actual filename confirmed)
blockchain-network/crypto-config/peerOrganizations/org1.landregistry.com/users/User1@org1.landregistry.com/msp/signcerts/User1@org1.landregistry.com-cert.pem

# Private key — actual filename is priv_sk (treat as a secret)
blockchain-network/crypto-config/peerOrganizations/org1.landregistry.com/users/User1@org1.landregistry.com/msp/keystore/priv_sk

# Peer TLS CA cert (trust anchor for gRPC connection)
blockchain-network/crypto-config/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt
```

Also tell them:
- **Peer endpoint:** `localhost:7051` (or the machine's IP if remote)
- **TLS override authority:** `peer0.org1.landregistry.com`
- **MSP ID:** `Org1MSP`
- **Channel:** `landchannel`
- **Chaincode:** `landregistry`

The backend's `application.properties` already has these as defaults for a local setup —
only communicate values that differ.

---

## 7. Teardown

```bash
cd blockchain-network
./network.sh down
```

This stops and removes all containers but does **not** delete `crypto-config/` or
`genesis.block`. To do a full clean restart:

```bash
./network.sh down
rm -rf crypto-config genesis.block landchannel.tx landchannel.block landregistry.tar.gz
./network.sh up
./deployChaincode.sh
```

---

## 8. Known Issues (from original handoff doc)

- `queryLandByOwner` does a full CouchDB scan — no index on `currentOwnerId`. Fine for
  dev/small datasets; add a CouchDB index in
  `META-INF/statedb/couchdb/indexes/` for production.
- `backend-api/pom.xml` is a 0-byte placeholder — only `build.gradle` is real.
- No `Dockerfile` exists for backend or frontend — only Fabric is containerized.
- Fabric binaries in `bin/` are Linux x86_64 only. Re-run `./install-fabric.sh` on
  ARM or macOS hosts.
