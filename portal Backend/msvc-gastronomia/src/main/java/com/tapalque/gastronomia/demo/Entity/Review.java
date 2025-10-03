package com.tapalque.gastronomia.demo.Entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idReview;

    private String comment;
    private int rating; // from 1 to 5
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "pkRestaurant", referencedColumnName = "idRestaurant", nullable = false)
    @JsonBackReference
    private Restaurant restaurant;

    public Review() {
    }

    public Review(String comment, int rating, LocalDate date, Restaurant restaurant) {
        this.comment = comment;
        this.rating = rating;
        this.date = date;
        this.restaurant = restaurant;
    }

    public Long getIdReview() {
        return idReview;
    }

    public void setIdReview(Long idReview) {
        this.idReview = idReview;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }
}
