package com.example.rental;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class AdminControllerTests {

    private MockMvc mockMvc;

    private AdminController adminController;
    private DbService dbService;

    @BeforeEach
    void setUp() {
        dbService = mock(DbService.class);
        adminController = new AdminController(dbService);

        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
    }

    @Test
    void testGetOrders_Empty() {
        List<Map<String, Object>> expectedOrders = Collections.emptyList();
        when(dbService.getOrdersFromDatabase()).thenReturn(expectedOrders);

        List<Map<String, Object>> actualOrders = adminController.getOrders();

        verify(dbService).getOrdersFromDatabase();

        assertEquals(expectedOrders, actualOrders);
    }

    @Test
    void testGetOrders_Failure() {
        List<Map<String, Object>> expectedOrders = Collections.emptyList();
        when(dbService.getOrdersFromDatabase()).thenReturn(expectedOrders);

        List<Map<String, Object>> actualOrders = adminController.getOrders();

        verify(dbService).getOrdersFromDatabase();

        assertEquals(expectedOrders, actualOrders);
    }

    @Test
    void testGetOrders_Success() throws Exception {
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

        when(dbService.getOrdersFromDatabase()).thenReturn(mockOrders);

        mockMvc.perform(MockMvcRequestBuilders.get("/admin/getorders"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].car").value("Volvo S60, 1500 kr/day"))
                .andExpect(jsonPath("$[0].start_date").value("2024-03-17"))
                .andExpect(jsonPath("$[0].end_date").value("2024-03-20"))
                .andExpect(jsonPath("$[0].driver_name").value("Arne Weise"))
                .andExpect(jsonPath("$[0].driver_age").value(80))
                .andExpect(jsonPath("$[0].total_price").value(4500));
    }


    @Test
    void testDeleteAllOrders_Success() {
        when(dbService.deleteAllOrders()).thenReturn(true);

        ResponseEntity<String> response = adminController.deleteAllOrders();

        verify(dbService).deleteAllOrders();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("All orders successfully deleted.", response.getBody());
    }

    @Test
    void testDeleteAllOrders_Failure() {
        when(dbService.deleteAllOrders()).thenReturn(false);

        ResponseEntity<String> response = adminController.deleteAllOrders();

        verify(dbService).deleteAllOrders();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to delete orders.", response.getBody());
    }

}