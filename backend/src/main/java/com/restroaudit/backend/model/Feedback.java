package com.restroaudit.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "Feedback")
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "Feedback_ID") private Integer feedbackId;
    @Column(name = "Rating_Score") private Integer ratingScore;
    @Column(name = "Text_Comments", columnDefinition = "TEXT") private String textComments;
    @ManyToOne @JoinColumn(name = "User_ID") private User user;
    @ManyToOne @JoinColumn(name = "Branch_ID") private Branch branch;
    @ManyToOne @JoinColumn(name = "Item_ID", nullable = false) private MenuItem menuItem;
    @Column(name = "Order_ID", nullable = false) private Integer orderId;
    
    public Integer getFeedbackId() { return feedbackId; } public void setFeedbackId(Integer feedbackId) { this.feedbackId = feedbackId; }
    public Integer getRatingScore() { return ratingScore; } public void setRatingScore(Integer ratingScore) { this.ratingScore = ratingScore; }
    public String getTextComments() { return textComments; } public void setTextComments(String textComments) { this.textComments = textComments; }
    public User getUser() { return user; } public void setUser(User user) { this.user = user; }
    public Branch getBranch() { return branch; } public void setBranch(Branch branch) { this.branch = branch; }
    public MenuItem getMenuItem() { return menuItem; } public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public Integer getOrderId() { return orderId; } public void setOrderId(Integer orderId) { this.orderId = orderId; }
}
