package com.example.rental;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

import static org.mockito.Mockito.when;


class RentControllerTests {

    private MockMvc mockMvc;
    private Order defaultOrder;

    @Mock
    private DbService dbService;

    @InjectMocks
    private RentController rentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(rentController).build();
        defaultOrder = createDefaultOrder();
    }

    private Order createDefaultOrder() {
        return new Order("Volvo S60, 1500 kr/day", LocalDate.now(),
                LocalDate.now().plusDays(3), "Sven", 55, 4500.0);
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
        mockMvc.perform(MockMvcRequestBuilders.get("/rent/getorders"))
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
    void testReceiveOrder_ValidOrder() throws Exception {
        when(dbService.saveOrder(any(Order.class))).thenReturn(true);

        mockMvc.perform(MockMvcRequestBuilders.post("/rent/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(defaultOrder.toJson()))
                .andExpect(status().isOk())
                .andExpect(content().string("Order saved in database."));
    }

    @Test
    void testReceiveOrder_InvalidOrder_BlankCar() throws Exception {
        defaultOrder.setCar("");
        mockMvc.perform(MockMvcRequestBuilders.post("/rent/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(defaultOrder.toJson()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Failed to save order: Car is required!"));
    }

    @Test
    void testReceiveOrder_InvalidOrder_InvalidName() throws Exception {
        defaultOrder.setDriverName("H3llo");
        mockMvc.perform(MockMvcRequestBuilders.post("/rent/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(defaultOrder.toJson()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Failed to save order: Invalid name!"));
    }

    @Test
    void testGetOrders_FailOrEmpty() throws Exception {
        List<Map<String, Object>> orders = Collections.emptyList();
        when(dbService.getOrdersFromDatabase()).thenReturn(orders);

        mockMvc.perform(MockMvcRequestBuilders.get("/rent/getorders"))
                        .andExpect(status().isOk())
                        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                        .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testReceiveOrder_InvalidDate() throws Exception {
        defaultOrder.setEndDate(defaultOrder.getStartDate().minusDays(3));

        mockMvc.perform(MockMvcRequestBuilders.post("/rent/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(defaultOrder.toJson()))
                        .andExpect(status().isBadRequest())
                        .andExpect(content().string("Failed to save order: Invalid dates! endDate is earlier than startDate + 1"));
    }

    @Test
    void testReceiveOrder_FailedToSave() throws Exception {
        when(dbService.saveOrder(defaultOrder)).thenReturn(false);

        mockMvc.perform(post("/rent/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(defaultOrder.toJson()))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to save order: Error in database"));
    }

}
