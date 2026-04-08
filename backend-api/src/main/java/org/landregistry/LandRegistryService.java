package org.landregistry;

import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.Network;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class LandRegistryService {

    private final Contract contract;

    @Autowired
    public LandRegistryService(Gateway gateway) {
        Network network = gateway.getNetwork("landchannel");
        this.contract = network.getContract("landregistry");
    }

    public String createLandAsset(String ulpin, String gpsCoordinates, String parentUlpin, String currentOwnerId, String documentHash) throws Exception {
        byte[] result = contract.submitTransaction("createLandAsset", ulpin, gpsCoordinates, parentUlpin, currentOwnerId, documentHash);
        return new String(result, StandardCharsets.UTF_8);
    }

    public String transferOwnership(String ulpin, String sellerId, String newOwnerId, String newDocumentHash) throws Exception {
        byte[] result = contract.submitTransaction("transferLandOwnership", ulpin, sellerId, newOwnerId, newDocumentHash); 
        return new String(result, StandardCharsets.UTF_8);
    }

    public String mutateLand(
            String parentUlpin, 
            String currentOwnerId, 
            String child1Ulpin, 
            String child1Gps, 
            String child2Ulpin, 
            String child2Gps, 
            String newDocumentHash) throws Exception {
        
        byte[] result = contract.submitTransaction(
            "mutateLand", 
            parentUlpin == null ? "" : parentUlpin, 
            currentOwnerId == null ? "" : currentOwnerId, 
            child1Ulpin == null ? "" : child1Ulpin, 
            child1Gps == null ? "" : child1Gps, 
            child2Ulpin == null ? "" : child2Ulpin, 
            child2Gps == null ? "" : child2Gps, 
            newDocumentHash == null ? "" : newDocumentHash
        );
        return new String(result, StandardCharsets.UTF_8);
    }

    public String getLandHistory(String ulpin) throws Exception {
        byte[] result = contract.evaluateTransaction("getAssetHistory", ulpin);
        return new String(result, StandardCharsets.UTF_8);
    }

    public String readLandAsset(String ulpin) throws Exception {
        byte[] result = contract.evaluateTransaction("queryLandByUlpin", ulpin);
        return new String(result, StandardCharsets.UTF_8);
    }

    public String queryLandByOwner(String ownerId) throws Exception {
        byte[] result = contract.evaluateTransaction("queryLandByOwner", ownerId);
        return new String(result, StandardCharsets.UTF_8);
    }
}