package org.landregistry;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import com.owlike.genson.Genson;

@Contract(
        name = "LandRegistryContract",
        info = @Info(
                title = "Land Registry Smart Contract",
                description = "The core chaincode executing business rules for Land Registration and Transfer",
                version = "1.1.0",
                license = @License(name = "Apache 2.0"),
                contact = @Contact(email = "admin@landregistry.gov.in", name = "Land Registry Admin")
        )
)
@Default
public final class LandRegistryContract implements ContractInterface {

    private final Genson genson = new Genson();

    private enum LandRegistryErrors {
        ASSET_NOT_FOUND,
        ASSET_ALREADY_EXISTS,
        ASSET_NOT_ACTIVE,
        UNAUTHORIZED_SELLER // Added to support Rule 2: Ownership Verification
    }

    /**
     * Initializes the ledger.
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public void initLedger(final Context ctx) {
        System.out.println("Land Registry Ledger Initialized.");
    }

    /**
     * Creates a new Land Asset on the blockchain.
     * * @param ctx the transaction context
     * @param ulpin the Unique Land Parcel Identification Number (Primary Key)
     * @param gpsCoordinates the mathematical anchor
     * @param parentUlpin Lineage tracking (pass "NONE" for root assets)
     * @param currentOwnerId The ID of the initial owner
     * @param documentHash The SHA-256 hash of the initial physical deed
     * @return the created LandAsset
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public LandAsset createLandAsset(final Context ctx, final String ulpin, final String gpsCoordinates, 
                                     final String parentUlpin, final String currentOwnerId, final String documentHash) {
        
        // Validation: Ensure the ULPIN doesn't already exist
        if (assetExists(ctx, ulpin)) {
            throw new ChaincodeException("Land Asset with ULPIN " + ulpin + " already exists", 
                                         LandRegistryErrors.ASSET_ALREADY_EXISTS.toString());
        }

        // Creation: Instantiate the Java object mapped to our updated model
        LandAsset land = new LandAsset(ulpin, gpsCoordinates, parentUlpin, currentOwnerId, documentHash, "ACTIVE");

        // Persistence: Convert to JSON and save to the CouchDB world state
        ctx.getStub().putStringState(ulpin, genson.serialize(land));

        return land;
    }

    /**
     * Executes Step 4: Smart Contract Execution to transfer land ownership.
     * * @param ctx the transaction context
     * @param ulpin the Primary Key of the land being transferred
     * @param sellerId the ID of the current owner attempting the transfer
     * @param buyerId the ID of the new owner
     * @param newDocumentHash the SHA-256 hash of the newly signed Sale Deed
     * @return the updated LandAsset
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public LandAsset transferLandOwnership(final Context ctx, final String ulpin, 
                                           final String sellerId, final String buyerId, final String newDocumentHash) {
        
        // RULE 1: Land Existence [cite: 87]
        // Does ULPIN exist? [cite: 88]
        String landJson = ctx.getStub().getStringState(ulpin);
        if (landJson == null || landJson.isEmpty()) {
            throw new ChaincodeException("Transaction Rejected: Land Asset " + ulpin + " does not exist", 
                                         LandRegistryErrors.ASSET_NOT_FOUND.toString());
        }

        // Deserialization
        LandAsset land = genson.deserialize(landJson, LandAsset.class);

        // RULE 2: Ownership Verification [cite: 90]
        // Is User A (sellerId) the current owner? [cite: 91]
        if (!land.getCurrentOwnerId().equals(sellerId)) {
            throw new ChaincodeException("Transaction Rejected: Seller ID " + sellerId + " is not the recognized owner of ULPIN " + ulpin, 
                                         LandRegistryErrors.UNAUTHORIZED_SELLER.toString());
        }

        // State Check: Cannot transfer mutated or retired land
        if (!land.getStatus().equals("ACTIVE")) {
            throw new ChaincodeException("Transaction Rejected: Land Asset " + ulpin + " is not ACTIVE", 
                                         LandRegistryErrors.ASSET_NOT_ACTIVE.toString());
        }

        // --- MUTATION PHASE ---
        // Instead of creating a new object, we use our new setters to update the state directly.
        land.setCurrentOwnerId(buyerId);
        land.setDocumentHash(newDocumentHash);

        // Step 5: Ledger Update - The CouchDB world state updates immediately[cite: 113, 114].
        // Overwrite the world state mapping ULPIN -> Owner: User B[cite: 117].
        ctx.getStub().putStringState(ulpin, genson.serialize(land));

        return land;
    }

    /**
     * Helper method to check if a land asset exists in the world state.
     */
    private boolean assetExists(final Context ctx, final String ulpin) {
        String landJson = ctx.getStub().getStringState(ulpin);
        return (landJson != null && !landJson.isEmpty());
    }
}