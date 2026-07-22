package com.restroaudit.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "Department")
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "Dept_ID") private Integer deptId;
    @Column(name = "Dept_Name", nullable = false, length = 50) private String deptName;
    public Integer getDeptId() { return deptId; } public void setDeptId(Integer deptId) { this.deptId = deptId; }
    public String getDeptName() { return deptName; } public void setDeptName(String deptName) { this.deptName = deptName; }
}
