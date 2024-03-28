package com.example.rental;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class DbService {

    private final JdbcTemplate db;

    public DbService(JdbcTemplate db) {
        this.db = db;
    }

    @PostConstruct
    public void createDatabaseTableOrders() {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'orders'";
            Integer result = db.queryForObject(sql, Integer.class);
            int tableCount = (result != null) ? result : 0;
            if (tableCount == 0) {
                String createTableSql = "CREATE TABLE orders (" +
                                        "id SERIAL PRIMARY KEY," +
                                        "car VARCHAR(255) NOT NULL," +
                                        "start_date DATE NOT NULL," +
                                        "end_date DATE NOT NULL," +
                                        "driver_name VARCHAR(255) NOT NULL," +
                                        "driver_age INTEGER NOT NULL," +
                                        "total_price DECIMAL(10, 2) NOT NULL)";
                db.update(createTableSql);
                System.out.println("*************Created 'orders' table in the database!*************");
            }
        } catch (DataAccessException e) {
            System.out.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<Map<String, Object>> getOrdersFromDatabase() {
        try {
            String sql = "SELECT * FROM orders";
            return db.queryForList(sql);
        } catch (DataAccessException e) {
            System.out.println("Error getting database: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public Boolean saveOrder(Order order) {
        try {
            String sql = "INSERT INTO orders " +
                         "(car, start_date, end_date, driver_name, driver_age, total_price) " +
                         "VALUES (?, ?, ?, ?, ?, ?)";
            db.update(sql,
                    order.getCar(),
                    order.getStartDate(),
                    order.getEndDate(),
                    order.getDriverName(),
                    order.getDriverAge(),
                    order.getTotalPrice());

            System.out.println("Order successfully inserted into the database.");
            return true;
        } catch (DataAccessException  e) {
            System.out.println("Error inserting order into the database: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteAllOrders() {
        try {
            String sql = "DELETE FROM orders";
            db.update(sql);
            System.out.println("All orders successfully deleted from the database.");
            return true;
        } catch (DataAccessException  e) {
            System.out.println("Error deleting orders from the database: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public String isDateFree(Order order) {
        try {
            String sql ="SELECT * FROM orders " +
                        "WHERE car = ? " +
                        "AND (" +
                            "(start_date <= ? AND end_date >= ?) " +
                            "OR " +
                            "(start_date <= ? AND end_date >= ?)" +
                        ")";

            // with test data in database, (same as in the frontend tests)
            // correct, 0 rows
            // SELECT * FROM orders WHERE car = 'Volkswagen Golf, 1333kr/day' AND ((start_date <= '2024-04-28' AND end_date >= '2024-04-28') OR (start_date <= '2024-04-29' AND end_date >= '2024-04-29'));

            // invalid start, 1 row
            // SELECT * FROM orders WHERE car = 'Volkswagen Golf, 1333kr/day' AND ((start_date <= '2024-04-27' AND end_date >= '2024-04-27') OR (start_date <= '2024-04-29' AND end_date >= '2024-04-29'));

            // invalid end, 1 row
            // SELECT * FROM orders WHERE car = 'Volkswagen Golf, 1333kr/day' AND ((start_date <= '2024-04-28' AND end_date >= '2024-04-28') OR (start_date <= '2024-04-30' AND end_date >= '2024-04-30'));
            LocalDate start_date = order.getStartDate();
            LocalDate end_date = order.getEndDate();
            if (db.queryForList(sql, order.getCar(), start_date, start_date, end_date, end_date).isEmpty()) {
                return "";
            } else {
                return "Car is already booked that date!";
            }
        } catch (DataAccessException e) {
            System.out.println("Error getting database: " + e.getMessage());
            e.printStackTrace();
            return "Database error when validating date.";
        }
    }
}
