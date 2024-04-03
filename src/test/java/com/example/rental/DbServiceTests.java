package com.example.rental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
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

    private ByteArrayOutputStream outputStream;
    private ByteArrayOutputStream errorStream;
    private PrintStream originalOut;
    private PrintStream originalErr;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        dbService = new DbService(jdbcTemplate);
        defaultOrder = createDefaultOrder();

        // Capture OutputStream and errorStream to verify and suppress stacktrace
        originalOut = System.out;
        originalErr = System.err;
        outputStream = new ByteArrayOutputStream();
        errorStream = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outputStream));
        System.setErr(new PrintStream(errorStream));
    }

    @AfterEach
    void tearDown() {
        System.setOut(originalOut);
        System.setErr(originalErr);
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
        assertThat(orders).isNull();
        assertThat(errorStream.toString()).contains(": Test exception");
    }

    @Test
    void testSaveOrder_Successful() {
        assertTrue(dbService.saveOrder(defaultOrder));
    }

    @Test
    void testSaveOrder_Failure() {
        when(jdbcTemplate.update(anyString(),
                anyString(),
                any(LocalDate.class),
                any(LocalDate.class),
                anyString(),
                anyInt(),
                anyDouble()))
                .thenThrow(new DataAccessException("Test exception") {});

        assertFalse(dbService.saveOrder(defaultOrder));
        assertThat(errorStream.toString()).contains(": Test exception");
    }

    @Test
    void testDeleteAllOrders_Successful() {
        assertTrue(dbService.deleteAllOrders());
    }

    @Test
    void testDeleteAllOrders_Failure() {
        when(jdbcTemplate.update(anyString())).thenThrow(new DataAccessException("Test exception") {});
        assertFalse(dbService.deleteAllOrders());
        assertThat(errorStream.toString()).contains(": Test exception");
    }

    @Test
    void testCreateDatabaseTableOrders_NoTable() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class))).thenReturn(0);
        dbService.createDatabaseTableOrders();

        assertTrue(outputStream.toString().contains("*************Created 'orders' table in the database!*************"));
    }

    @Test
    void testCreateDatabaseTableOrders_NoReturn() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class))).thenReturn(null);
        dbService.createDatabaseTableOrders();

        assertThat(outputStream.toString()).contains("*************Created 'orders' table in the database!*************");
    }

    @Test
    void testCreateDatabaseTableOrders_TableExists() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);
        dbService.createDatabaseTableOrders();

        assertThat(outputStream.toString()).doesNotContain("*************Created 'orders' table in the database!*************");
    }

    @Test
    void testCreateDatabaseTableOrders_Error() {
        when(jdbcTemplate.update(anyString())).thenThrow(new DataAccessException("Test exception") {});
        dbService.createDatabaseTableOrders();

        assertThat(outputStream.toString()).contains("Error initializing database: Test exception");
        assertThat(errorStream.toString()).contains(": Test exception");
    }

    @Test
    void testIsDateFree_Successful() {
        when(jdbcTemplate.queryForList(
                anyString(),
                any(LocalDate.class),
                any(LocalDate.class),
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(Collections.emptyList());

        String result = dbService.isDateFree(defaultOrder);
        assertThat(result).isEmpty();
    }

    @Test
    void testIsDateFree_Failure() {
        when(jdbcTemplate.queryForList(
                anyString(),
                anyString(),
                any(LocalDate.class),
                any(LocalDate.class),
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenAnswer( invocation -> {
            List<Map<String, Object>> resultList = new ArrayList<>();
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("test", defaultOrder);
            resultList.add(resultMap);
            return resultList;
        });
        String result = dbService.isDateFree(defaultOrder);
        assertThat(result).contains("Car is already booked that date!");
        assertThat(errorStream.toString()).doesNotContain(": Test exception");
    }

    @Test
    void testIsDateFree_Error() {
        when(jdbcTemplate.queryForList(
                anyString(),
                anyString(),
                any(LocalDate.class),
                any(LocalDate.class),
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenThrow(new DataAccessException("Test exception") {});

        String result = dbService.isDateFree(defaultOrder);
        assertThat(result).contains("Database error when validating date.");
        assertThat(errorStream.toString()).contains(": Test exception");
    }


}
