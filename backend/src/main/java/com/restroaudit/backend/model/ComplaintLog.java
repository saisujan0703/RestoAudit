package com.restroaudit.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "Complaint_Log")
public class ComplaintLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "Log_ID") private Integer logId;
    @Column(name = "Status", length = 20) private String status;
    @Column(name = "Resolution_Notes", columnDefinition = "TEXT") private String resolutionNotes;
    @OneToOne @JoinColumn(name = "Feedback_ID", nullable = false, unique = true) private Feedback feedback;
    
    public Integer getLogId() { return logId; } public void setLogId(Integer logId) { this.logId = logId; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getResolutionNotes() { return resolutionNotes; } public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public Feedback getFeedback() { return feedback; } public void setFeedback(Feedback feedback) { this.feedback = feedback; }
}
