package com.example.rental;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class OrderTests {

    @Test
    void testConstructorAndGetters() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 55, 4500.0);

        assertEquals("Volvo S60, 1500 kr/day", order.getCar());
        assertEquals(startDate, order.getStartDate());
        assertEquals(endDate, order.getEndDate());
        assertEquals("Sven", order.getDriverName());
        assertEquals(55, order.getDriverAge());
        assertEquals(4500.0, order.getTotalPrice());
    }

    @Test
    void testValidation_ValidOrder() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 55, 4500.0);

        String validationResult = order.validate();
        assertTrue(validationResult.isEmpty());
    }

    @Test
    void testValidation_InvalidName_Numbers() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "123", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid name!", validationResult);
    }



    @Test
    void testValidation_InvalidName_SpecialSign() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Alex!", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid name!", validationResult);
    }

    @Test
    void testValidation_InvalidName_SpecialSign2() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Alex'", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid name!", validationResult);
    }

    @Test
    void testValidation_InvalidName_Null() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                null, 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Driver name is required!", validationResult);
    }

    @Test
    void testValidation_InvalidName_Empty() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid name!", validationResult);
    }

    @Test
    void testValidation_InvalidAgeUnder18() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 17, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid age. Only 18+ are allowed!", validationResult);
    }

    @Test
    void testValidation_InvalidAgeOver100() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 101, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid age. Max age is 100.", validationResult);
    }

    @Test
    void testValidation_InvalidAge_Null() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", null, 4500.0);

        String validationResult = order.validate();
        assertEquals("Driver age is required!", validationResult);
    }

    @Test
    void testValidation_InvalidDates_NullStart() {
        LocalDate endDate = LocalDate.now();
        Order order = new Order("Volvo S60, 1500 kr/day", null, endDate,
                "Sven", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Start date and end date are required!", validationResult);
    }

    @Test
    void testValidation_InvalidDates_NullEnd() {
        LocalDate startDate = LocalDate.now();
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, null,
                "Sven", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Start date and end date are required!", validationResult);
    }

    @Test
    void testValidation_InvalidEndDateBeforeStartDate() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().minusDays(1);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Invalid dates! endDate is earlier than startDate + 1", validationResult);
    }

    @Test
    void testValidation_InvalidCar() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Invalid Car", startDate, endDate,
                "Sven", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Car is not recognized! Got \"Invalid Car\"", validationResult);
    }

    @Test
    void testValidation_InvalidCarNull() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order(null, startDate, endDate,
                "Sven", 55, 4500.0);

        String validationResult = order.validate();
        assertEquals("Car is required!", validationResult);
    }

    @Test
    void testValidation_PriceMismatch_High() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 55, 5000.0);

        String validationResult = order.validate();
        assertEquals("Difference in calculated price and price given from frontend!", validationResult);
    }

    @Test
    void testValidation_PriceMismatch_Low() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(3);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 55, 4000.0);

        String validationResult = order.validate();
        assertEquals("Difference in calculated price and price given from frontend!", validationResult);
    }


    @Test
    void testToJson() {
        LocalDate startDate = LocalDate.of(2024, 3, 17);
        LocalDate endDate = LocalDate.of(2024, 3, 20);
        Order order = new Order("Volvo S60, 1500 kr/day", startDate, endDate,
                "Sven", 55, 4500.0);

        String json = order.toJson();

        String expectedJson = "{" +
                "\"car\": \"Volvo S60, 1500 kr/day\"," +
                "\"startDate\": \"2024-03-17\"," +
                "\"endDate\": \"2024-03-20\"," +
                "\"driverName\": \"Sven\"," +
                "\"driverAge\": 55," +
                "\"totalPrice\": 4500.0" +
                "}";

        assertEquals(expectedJson, json);
    }
}

