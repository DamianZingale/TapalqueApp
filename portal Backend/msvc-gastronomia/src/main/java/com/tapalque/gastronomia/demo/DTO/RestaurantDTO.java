package com.tapalque.gastronomia.demo.DTO;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.tapalque.gastronomia.demo.Entity.Category;
import com.tapalque.gastronomia.demo.Entity.PhoneNumber;
import com.tapalque.gastronomia.demo.Entity.PhoneType;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Entity.Schedule;

public class RestaurantDTO {

    private Long id;
    private String name;
    private String address;
    private String email;
    private Double latitude;
    private Double longitude; 
    private String categories; // concatenadas con ', '
    private String phones;     // concatenados con ', '
    private String schedule;    // concatenado tipo "1:09:00-22:00; 2:09:00-22:00"
    private boolean delivery;  

    // 🔹 Constructor vacío
    public RestaurantDTO() {}

    // 🔹 Constructor con todos los campos
    public RestaurantDTO(Long id, String name, String address, String email, Double latitude, Double longitude,
                         String categories, String phones, String schedule, boolean delivery) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.email = email;
        this.latitude = (latitude == null) ? latitude : 0;
        this.longitude = (longitude == null) ? longitude : 0;
        this.categories = categories;
        this.phones = phones;
        this.schedule = schedule;
        this.delivery = delivery;
    }

    // 🔹 Constructor que recibe una entidad
    public RestaurantDTO(Restaurant entity) {
    this.id = entity.getIdRestaurant();
    this.name = entity.getName();
    this.address = entity.getAddress();
    this.email = entity.getEmail();
    this.latitude = Optional.ofNullable(entity.getcoordinate_lat()).orElse(0.0);
    this.longitude = Optional.ofNullable(entity.getCoordinate_lon()).orElse(0.0);
    this.delivery = entity.getDelivery();
    // Categories: List<Category> -> String
    if(entity.getCategories() != null) {
        this.categories = entity.getCategories().stream()
                            .map(Category::getName)
                            .reduce((a,b) -> a + ", " + b)
                            .orElse("");
    }

   
    // Phones: List<PhoneNumber> -> String
    if(entity.getPhoneNumbers() != null) {
    this.phones = entity.getPhoneNumbers().stream()
                        .map(PhoneNumber::getNumber) 
                        .collect(Collectors.joining(", ")); 
    }

    if(entity.getSchedules() != null) {
    this.schedule = entity.getSchedules().stream()
                        .map(s -> s.getDayOfWeek() + ":" + s.getOpeningTime() + "-" + s.getClosingTime())
                        .collect(Collectors.joining("; "));
        }

    }

    // 🔹 Método para convertir DTO a entidad
    public Restaurant toEntity() {
    Restaurant entity = new Restaurant();
    entity.setIdRestaurant(this.id);
    entity.setName(this.name);
    entity.setAddress(this.address);
    entity.setEmail(this.email);
    entity.setCoordinate_lat(Optional.ofNullable(this.latitude).orElse(0.0));
    entity.setCoordinate_lon(Optional.ofNullable(this.longitude).orElse(0.0));
    entity.setDelivery(this.delivery);

    // Categories: String -> List<Category>
    if(this.categories != null && !this.categories.isEmpty()) {
        List<Category> categoryList = Arrays.stream(this.categories.split(","))
                                        .map(String::trim)
                                        .map(category_name -> {
                                            Category c = new Category();
                                            c.setName(category_name);
                                            return c;
                                        })
                                        .toList();
        entity.setCategories(categoryList);
    }

    // Phones: String -> List<PhoneNumber>
    if(this.phones != null && !this.phones.isEmpty()) {
    List<PhoneNumber> phoneList = Arrays.stream(this.phones.split(","))
                                        .map(String::trim)
                                        .map(num -> {
                                            PhoneNumber p = new PhoneNumber();
                                            p.setNumber(num);
                                            p.setType(PhoneType.WHATSAPP);
                                            p.setRestaurant(entity); 
                                            return p;
                                        })
                                        .toList();
    entity.setPhoneNumbers(phoneList);
}
    // Schedule: List<ScheduleDTO> -> List<Schedule>
    if(this.schedule != null && !this.schedule.isEmpty()) {
    List<Schedule> scheduleList = Arrays.stream(this.schedule.split(";"))
    .map(String::trim)
    .map(str -> {
        String[] dayAndTimes = str.split(":", 2); // Solo primer ':'
        Schedule s = new Schedule();
        s.setDayOfWeek(Integer.valueOf(dayAndTimes[0]));

        if (dayAndTimes.length == 2) {
            String timesPart = dayAndTimes[1];
            
            // Verificar si es "Cerrado" o tiene horarios
            if (timesPart.equalsIgnoreCase("Cerrado") || !timesPart.contains("-")) {
                s.setOpeningTime("Cerrado");
                s.setClosingTime("Cerrado");
            } else {
                // Tiene formato "10:00-20:00"
                String[] times = timesPart.split("-");
                if (times.length == 2) {
                    s.setOpeningTime(times[0].trim());
                    s.setClosingTime(times[1].trim());
                } else {
                    s.setOpeningTime("Cerrado");
                    s.setClosingTime("Cerrado");
                }
            }
        } else {
            // No hay segunda parte después del ':'
            s.setOpeningTime("Cerrado");
            s.setClosingTime("Cerrado");
        }
        
        s.setRestaurant(entity); 
        return s;
        
    })
    .toList();

entity.setSchedules(scheduleList);
}
    entity.setDelivery(delivery);

    return entity;
}


    // 🔹 Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = (latitude != null) ? latitude : 0.0;
    }

    public Double getLongitude (){
        return longitude;
    }

    public void setLongitude (Double longitude){
        this.longitude = (longitude != null) ? longitude : 0.0;
    }

    public String getCategories() {
        return categories;
    }

    public void setCategories(String categories) {
        this.categories = categories;
    }

    public String getPhones() {
        return phones;
    }

    public void setPhones(String phones) {
        this.phones = phones;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public boolean isDelivery() {
        return delivery;
    }

    public void setDelivery(boolean delivery) {
        this.delivery = delivery;
    }
    
}
