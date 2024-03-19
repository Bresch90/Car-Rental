package com.example.rental;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class Order {
    private String car;
    private LocalDate startDate;
    private LocalDate endDate;
    private String driverName;
    private Integer driverAge;
    private Double totalPrice;

    public Order() {
    }

    public Order(String car, LocalDate startDate, LocalDate endDate, String driverName, Integer driverAge, Double totalPrice) {
        this.car = car;
        this.startDate = startDate;
        this.endDate = endDate;
        this.driverName = driverName;
        this.driverAge = driverAge;
        this.totalPrice = totalPrice;
    }

    public String getCar() {
        return car;
    }

    public void setCar(String car) {
        this.car = car;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public int getDriverAge() {
        return driverAge;
    }

    public void setDriverAge(int driverAge) {
        this.driverAge = driverAge;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String validate() {
        if (driverName == null) { return "Driver name is required!"; }

        if (!this.driverName.matches("^[a-zåäöA-ZÅÄÖ]+(\\s[a-zåäöA-ZÅÄÖ]+)?$")) {return "Invalid name!";}

        if (driverAge == null) {
            return "Driver age is required!";
        }

        if (this.driverAge < 18) {
            return "Invalid age. Only 18+ are allowed!";
        } else if (this.driverAge > 100) {
            return "Invalid age. Max age is 100.";
        }

        if (startDate == null || endDate == null) {
            return "Start date and end date are required!";
        }

        LocalDate tomorrow = this.startDate.plusDays(1);
        if (this.endDate.isBefore(tomorrow)) {return "Invalid dates! endDate is earlier than startDate + 1";}

        if (car == null || car.trim().isEmpty()) {
            return "Car is required!";
        }

        int carPrice = 0;
        switch (this.car) {
            case "Volkswagen Golf, 1333kr/day":
                carPrice = 1333;
                break;
            case "Volvo S60, 1500 kr/day":
                carPrice = 1500;
                break;
            case "Ford Transit, 2400kr/day":
                carPrice = 2400;
                break;
            case "Ford Mustang, 3000kr/day":
                carPrice = 3000;
                break;
            default:
                return "Car is not recognized! Got \"" + this.car + "\"";
        }

        long numberOfDays = this.startDate.until(this.endDate, ChronoUnit.DAYS);
        double localPrice = numberOfDays * carPrice;

        if (localPrice != this.totalPrice) {
            System.out.println("Miss match in price, checking rounding error");
            System.out.println("localPrice=" + localPrice + " totalPrice="+ this.totalPrice);
            this.totalPrice = (double) Math.round(this.totalPrice);
            localPrice = Math.round(localPrice);

            if (localPrice != this.totalPrice) {return "Difference in calculated price and price given from frontend!";}
        }
        return "";
    }

    public String toJson() {
        return "{" +
                "\"car\": \"" + car + "\"," +
                "\"startDate\": \"" + startDate + "\"," +
                "\"endDate\": \"" + endDate + "\"," +
                "\"driverName\": \"" + driverName + "\"," +
                "\"driverAge\": " + driverAge + "," +
                "\"totalPrice\": " + totalPrice +
                "}";
    }

}
