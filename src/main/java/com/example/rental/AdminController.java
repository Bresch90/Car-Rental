package com.example.rental;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

	private final DbService dbService;

	public AdminController(DbService dbService) {
		this.dbService = dbService;
	}

	@GetMapping("/getorders")
	public List<Map<String, Object>> getOrders() {
		return dbService.getOrdersFromDatabase();
	}

	@DeleteMapping("/deleteAllOrders")
	public ResponseEntity<String> deleteAllOrders() {
		if (dbService.deleteAllOrders()) {
			return ResponseEntity.ok("All orders successfully deleted.");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete orders.");
		}
	}

}
