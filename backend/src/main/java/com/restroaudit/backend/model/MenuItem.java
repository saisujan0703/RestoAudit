package com.restroaudit.backend.model;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Menu_Item")
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "Item_ID") private Integer itemId;
    @Column(name = "Item_Name", nullable = false, length = 100) private String itemName;
    @Column(name = "Price", nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(name = "Category", length = 50) private String category;
    
    public Integer getItemId() { return itemId; } public void setItemId(Integer itemId) { this.itemId = itemId; }
    public String getItemName() { return itemName; } public void setItemName(String itemName) { this.itemName = itemName; }
    public BigDecimal getPrice() { return price; } public void setPrice(BigDecimal price) { this.price = price; }
    public String getCategory() { return category; } public void setCategory(String category) { this.category = category; }
}
