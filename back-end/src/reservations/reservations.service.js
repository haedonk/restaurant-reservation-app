const knex = require("../db/connection");

function list(date){
    return knex("reservations")
        .select("*")
        .where("reservation_date", date)
        .orderBy("reservation_time", "asc")
}

function create(reservation){
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then(allReservations => allReservations[0])
        //.catch(error => error)
}

function read(reservation_id){
    return knex("reservations")
        .select("*")
        .where("reservation_id", reservation_id)
        .first();
}

module.exports = {
    list,
    create,
    read,
}