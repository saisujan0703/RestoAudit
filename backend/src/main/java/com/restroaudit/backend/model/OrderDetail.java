package com.restroaudit.backend.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "order_details")
@IdClass(OrderDetail.OrderDetailId.class)
public class OrderDetail {

    @Id
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Id
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItem menuItem;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public static class OrderDetailId implements Serializable {
        private Integer order;
        private Integer menuItem;

        public OrderDetailId() {}

        public Integer getOrder() { return order; }
        public void setOrder(Integer order) { this.order = order; }
        public Integer getMenuItem() { return menuItem; }
        public void setMenuItem(Integer menuItem) { this.menuItem = menuItem; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            OrderDetailId that = (OrderDetailId) o;
            return java.util.Objects.equals(order, that.order) && java.util.Objects.equals(menuItem, that.menuItem);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(order, menuItem);
        }
    }
}
