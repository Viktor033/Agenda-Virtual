package com.saas.shifty.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
public class Subscription extends AbstractTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Column(name = "plan_type", nullable = false)
    private String planType = "basic"; // 'basic', 'standard', 'premium'

    @Column(nullable = false, length = 50)
    private String status = "incomplete"; // 'active', 'trialing', 'past_due', 'canceled', etc.

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;
}
