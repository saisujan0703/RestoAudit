package com.restroaudit.backend.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "order_id") 
    private Integer orderId;
    
    @Column(name = "order_timestamp", insertable = false, updatable = false) 
    private LocalDateTime orderTime;
    
    @ManyToOne 
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;
    
    @ManyToOne 
    @JoinColumn(name = "branch_id", nullable = false) 
    private Branch branch;

    @Column(name = "order_status", nullable = false)
    private String orderStatus = "COMPLETED"; // default
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private java.util.List<OrderDetail> orderDetails;

    public Integer getOrderId() { return orderId; } public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public LocalDateTime getOrderTime() { return orderTime; } public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
    public User getUser() { return user; } public void setUser(User user) { this.user = user; }
    public Branch getBranch() { return branch; } public void setBranch(Branch branch) { this.branch = branch; }
    public String getOrderStatus() { return orderStatus; } public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public java.util.List<OrderDetail> getOrderDetails() { return orderDetails; } public void setOrderDetails(java.util.List<OrderDetail> orderDetails) { this.orderDetails = orderDetails; }
}
