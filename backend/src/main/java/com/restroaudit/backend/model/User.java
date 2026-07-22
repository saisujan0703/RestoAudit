package com.restroaudit.backend.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "User_ID") private Integer userId;
    @Column(name = "First_Name", nullable = false, length = 50) private String firstName;
    @Column(name = "Last_Name", length = 50) private String lastName;
    @Column(name = "Email", nullable = false, unique = true, length = 100) private String email;
    @Column(name = "Phone_No", length = 15) private String phoneNo;
    @Column(name = "User_Role", length = 20) private String userRole;
    @ManyToOne @JoinColumn(name = "Branch_ID") @JsonIgnoreProperties({"hibernateLazyInitializer","handler"}) private Branch branch;
    @ManyToOne @JoinColumn(name = "Dept_ID") @JsonIgnoreProperties({"hibernateLazyInitializer","handler"}) private Department department;
    
    @Column(name = "loyalty_points") private Integer loyaltyPoints = 0;

    
    public Integer getUserId() { return userId; } public void setUserId(Integer userId) { this.userId = userId; }
    public String getFirstName() { return firstName; } public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; } public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhoneNo() { return phoneNo; } public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
    public String getUserRole() { return userRole; } public void setUserRole(String userRole) { this.userRole = userRole; }
    public Branch getBranch() { return branch; } public void setBranch(Branch branch) { this.branch = branch; }
    public Department getDepartment() { return department; } public void setDepartment(Department department) { this.department = department; }
    public Integer getLoyaltyPoints() { return loyaltyPoints; } public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
}
