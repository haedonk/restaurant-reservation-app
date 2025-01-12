
const bodyHas = require("../utils/bodyDataHas");

const service = require("./tables.service");

async function list(req, res){
    const data = await service.list();
    res.json({data: data});
}

async function create(req, res){
    const data = await service.create(req.body.data);
    res.status(201).json({data: data});
}

async function update(req, res){
    const updateTable = {
        ...res.locals.table,
        reservation_id: res.locals.reservation.reservation_id
    }
    const updateData = await service.update(updateTable);
    res.json({data: updateData})
}

async function reservationExists(req, res, next){
    if(!req.body.data) return next({ status: 400, message: `Data is missing` })
    const { data = {} } = req.body;
    if(data.reservation_id){
        const reservation = await service.read(data.reservation_id);
        if(reservation){
            res.locals.reservation = reservation;
            return next();
        }
        else{
            return next({ status: 404, message: `Reservation ${data.reservation_id} does not exist` })
        }
    }
    next({ status: 404, message: `reservation_id cannot be found.` })
}

async function isOccupied(req, res, next){
    res.locals.table = await service.readTable(req.params.table_id);
    if(res.locals.table.reservation_id){
        next({ status: 400, message: `occupied` })
    }
    next();
}

function validCap(req, res, next){
    const cap = req.body.data.capacity;
    if(typeof(cap) !== "number" || cap === 0){
        return next({status: 400, message: `capacity`});
      }
    next();
}

function validName(req, res, next){
    const name = req.body.data.table_name;
    if(name.length < 2){
        return next({status: 400, message: `table_name must have a length of 2 or more`});
    }
    next();
}

function compCap(req, res, next){
    const tableCap = res.locals.table.capacity;
    const resCap = res.locals.reservation.people;
    if(tableCap < resCap){
        return next({status: 400, message: `capacity`});
    }
    next();
}


module.exports = {
    list,
    create: [
        bodyHas("table_name"),
        bodyHas("capacity"),
        validCap,
        validName,
        create
    ],
    update: [
        bodyHas("reservation_id"),
        reservationExists,
        isOccupied,
        compCap,
        update
    ]
}