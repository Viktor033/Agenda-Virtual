package com.saas.shifty.entity;

public enum PaymentOption {
    BASIC(0),
    STANDARD(10),
    PREMIUM(20),
    TRIAL(0);

    private final int price;

    PaymentOption(int price) {
        this.price = price;
    }

    public int getPrice() {
        return price;
    }
}
