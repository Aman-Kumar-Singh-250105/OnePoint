package com.onepoint.formmanager.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "form_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String templateJson;

    private String iconName;
}
