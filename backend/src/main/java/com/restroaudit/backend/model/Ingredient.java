package com.restroaudit.backend.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Ingredient")
public class Ingredient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "Ing_ID") private Integer ingId;
    @Column(name = "Ing_Name", nullable = false, length = 100) private String ingName;
    @Column(name = "Stock_Quantity", precision = 10, scale = 2) private BigDecimal stockQuantity;
    @Column(name = "Expiry_Date") private LocalDate expiryDate;
    
    public Integer getIngId() { return ingId; } public void setIngId(Integer ingId) { this.ingId = ingId; }
    public String getIngName() { return ingName; } public void setIngName(String ingName) { this.ingName = ingName; }
    public BigDecimal getStockQuantity() { return stockQuantity; } public void setStockQuantity(BigDecimal stockQuantity) { this.stockQuantity = stockQuantity; }
    public LocalDate getExpiryDate() { return expiryDate; } public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
