package org.landregistry;

import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import com.owlike.genson.annotation.JsonProperty;
import java.util.Objects;

@DataType()
public final class LandAsset {

    @Property()
    private final String ulpin;

    @Property()
    private final String gpsCoordinates;

    @Property()
    private final String parentUlpin;

    @Property()
    private final String currentOwnerId; 

    @Property()
    private final String documentHash;

    @Property()
    private final String status;

    public LandAsset(@JsonProperty("ulpin") final String ulpin,
                     @JsonProperty("gpsCoordinates") final String gpsCoordinates,
                     @JsonProperty("parentUlpin") final String parentUlpin,
                     @JsonProperty("currentOwnerId") final String currentOwnerId,
                     @JsonProperty("documentHash") final String documentHash,
                     @JsonProperty("status") final String status) {
        this.ulpin = ulpin;
        this.gpsCoordinates = gpsCoordinates;
        this.parentUlpin = parentUlpin;
        this.currentOwnerId = currentOwnerId;
        this.documentHash = documentHash;
        this.status = status;
    }

    public String getUlpin() { return ulpin; }
    public String getGpsCoordinates() { return gpsCoordinates; }
    public String getParentUlpin() { return parentUlpin; }
    public String getCurrentOwnerId() { return currentOwnerId; }
    public String getDocumentHash() { return documentHash; }
    public String getStatus() { return status; }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if ((obj == null) || (getClass() != obj.getClass())) return false;
        LandAsset other = (LandAsset) obj;
        return Objects.equals(getUlpin(), other.getUlpin())
                && Objects.equals(getGpsCoordinates(), other.getGpsCoordinates())
                && Objects.equals(getParentUlpin(), other.getParentUlpin())
                && Objects.equals(getCurrentOwnerId(), other.getCurrentOwnerId())
                && Objects.equals(getDocumentHash(), other.getDocumentHash())
                && Objects.equals(getStatus(), other.getStatus());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getUlpin(), getGpsCoordinates(), getParentUlpin(), getCurrentOwnerId(), getDocumentHash(), getStatus());
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "@" + Integer.toHexString(hashCode()) 
            + " [ulpin=" + ulpin + ", currentOwnerId=" + currentOwnerId + ", status=" + status + "]";
    }
}