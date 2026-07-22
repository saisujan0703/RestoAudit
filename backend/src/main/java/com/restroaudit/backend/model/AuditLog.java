package com.restroaudit.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Integer auditId;

    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName;

    @Column(name = "action_type", nullable = false, length = 10)
    private String actionType;

    @Column(name = "record_id")
    private Integer recordId;

    @Column(name = "action_timestamp")
    private LocalDateTime actionTimestamp;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    public Integer getAuditId() { return auditId; }
    public void setAuditId(Integer auditId) { this.auditId = auditId; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer recordId) { this.recordId = recordId; }

    public LocalDateTime getActionTimestamp() { return actionTimestamp; }
    public void setActionTimestamp(LocalDateTime actionTimestamp) { this.actionTimestamp = actionTimestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
