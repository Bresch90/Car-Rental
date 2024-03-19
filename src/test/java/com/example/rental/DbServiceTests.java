package com.example.rental;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public class DbServiceTests {

    private JdbcTemplate jdbcTemplate;
    private DbService dbService;
    private Order defaultOrder;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        dbService = new DbService(jdbcTemplate);
        defaultOrder = createDefaultOrder();
    }

    private Order createDefaultOrder() {
        return new Order("Volvo S60, 1500 kr/day", LocalDate.now(),
                LocalDate.now().plusDays(3), "Sven", 55, 4500.0);
    }

    @Test
    void testGetOrdersFromDatabase_ValidOrder() {
        List<Map<String, Object>> mockOrders = new ArrayList<>();
        Map<String, Object> order1 = new HashMap<>();
        order1.put("id", 1);
        order1.put("car", "Volvo S60, 1500 kr/day");
        order1.put("start_date", "2024-03-17");
        order1.put("end_date", "2024-03-20");
        order1.put("driver_name", "Arne Weise");
        order1.put("driver_age", 80);
        order1.put("total_price", 4500);
        mockOrders.add(order1);

        when(jdbcTemplate.queryForList(anyString())).thenReturn(mockOrders);
        assertEquals(mockOrders, dbService.getOrdersFromDatabase());
    }

    @Test
    void testGetOrdersFromDatabase_EmptyDatabase() {
        when(jdbcTemplate.queryForList(anyString())).thenReturn(Collections.emptyList());
        List<Map<String, Object>> orders = dbService.getOrdersFromDatabase();
        assertTrue(orders.isEmpty());
    }

    @Test
    void testGetOrdersFromDatabase_Failure() {
        when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Test exception") {});
        List<Map<String, Object>> orders = dbService.getOrdersFromDatabase();
        assertTrue(orders.isEmpty());
    }

    @Test
    void testSaveOrder_Successful() {
        assertTrue(dbService.saveOrder(defaultOrder));
    }

    @Test
    void testSaveOrder_Failure() {
        String sql = "INSERT INTO orders " +
                "(car, start_date, end_date, driver_name, driver_age, total_price) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        when(jdbcTemplate.update(sql,
                defaultOrder.getCar(),
                defaultOrder.getStartDate(),
                defaultOrder.getEndDate(),
                defaultOrder.getDriverName(),
                defaultOrder.getDriverAge(),
                defaultOrder.getTotalPrice()))
                .thenThrow(new DataAccessException("Test exception") {});

        assertFalse(dbService.saveOrder(defaultOrder));
    }

    @Test
    void testDeleteAllOrders_Successful() {
        assertTrue(dbService.deleteAllOrders());
    }

    @Test
    void testDeleteAllOrders_Failure() {
        when(jdbcTemplate.update(anyString())).thenThrow(new DataAccessException("Test exception") {});
        assertFalse(dbService.deleteAllOrders());
    }
}
