package com.restroaudit.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "Branch")
public class Branch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "Branch_ID") private Integer branchId;
    @Column(name = "Phone_No", length = 15) private String phoneNo;
    @Column(name = "Street_No", length = 20) private String streetNo;
    @Column(name = "Pin_Code", length = 10) private String pinCode;
    @Column(name = "Address_Line") private String addressLine;
    public Integer getBranchId() { return branchId; } public void setBranchId(Integer branchId) { this.branchId = branchId; }
    public String getPhoneNo() { return phoneNo; } public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
    public String getStreetNo() { return streetNo; } public void setStreetNo(String streetNo) { this.streetNo = streetNo; }
    public String getPinCode() { return pinCode; } public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public String getAddressLine() { return addressLine; } public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
}
