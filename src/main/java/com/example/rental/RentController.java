package com.example.rental;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rent")
public class RentController {

	private final DbService dbService;

	public RentController(DbService dbService) {
		this.dbService = dbService;
	}

	@GetMapping("/getorders")
	public ResponseEntity<List<Map<String, Object>>> getOrders() {
		List<Map<String, Object>> orders = dbService.getOrdersFromDatabase();
		if (orders == null) {
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
		}
		return ResponseEntity.status(HttpStatus.OK).body(orders);
	}

	@PostMapping("/order")
	public ResponseEntity<String> receiveOrder(@RequestBody Order order) {
			String validationResult;

			validationResult = order.validate();
			if (validationResult.isEmpty()) {
				validationResult = dbService.isDateFree(order);
			}

			if (!validationResult.isEmpty()) {
				System.out.println("Order is invalid, got: \"" + validationResult + "\"");
				System.out.println("Scrapping order.");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to save order: " + validationResult);
			}
			if (!dbService.saveOrder(order)) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save order: Error in database");
			}
			return ResponseEntity.ok("Order saved in database.");
	}
}
