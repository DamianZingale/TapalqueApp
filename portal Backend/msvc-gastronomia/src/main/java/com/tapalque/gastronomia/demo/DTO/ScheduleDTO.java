package com.tapalque.gastronomia.demo.DTO;
import com.tapalque.gastronomia.demo.Entity.Schedule;

public class ScheduleDTO {
    private Long idSchedule;
    private int dayOfWeek;
    private String openingTime;
    private String closingTime;

    public ScheduleDTO() {}

    public ScheduleDTO(Schedule schedule) {
        this.idSchedule = schedule.getIdSchedule();
        this.dayOfWeek = schedule.getDayOfWeek();
        this.openingTime = schedule.getOpeningTime();
        this.closingTime = schedule.getClosingTime();
    }

    public Schedule toEntity() {
        Schedule s = new Schedule();
        s.setIdSchedule(this.idSchedule);
        s.setDayOfWeek(this.dayOfWeek);
        s.setOpeningTime(this.openingTime);
        s.setClosingTime(this.closingTime);
        return s;
    }

    public Long getIdSchedule() {
        return idSchedule;
    }

    public void setIdSchedule(Long idSchedule) {
        this.idSchedule = idSchedule;
    }

    public int getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(int dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(String openingTime) {
        this.openingTime = openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(String closingTime) {
        this.closingTime = closingTime;
    }

    
}
