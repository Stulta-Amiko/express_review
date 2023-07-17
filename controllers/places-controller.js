import { validationResult } from 'express-validator'
import mongoose from 'mongoose'
import fs from 'fs'

import Place from '../models/place.js'
import HttpError from '../models/http-error.js'
import getCoordsForAddres from '../util/loaction.js'
import User from '../models/user.js'

const getPlaceById = async(req, res, next) => {
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError(
            'Somthing went wrong, could not find a place',
            500
        )
        return next(error)
    }
    console.log('GET Request in Places')

    if (!place) {
        const error = HttpError('Could not find a place for the provided id', 404)
        return next(error)
    }

    res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async(req, res, next) => {
    const userId = req.params.uid

    let userWithPlaces

    try {
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err) {
        const error = HttpError('Somthing went wrong, could not find a place', 500)
        return next(error)
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        const error = new HttpError(
            'Could not find a user for the provided id',
            404
        )
        return next(error)
    }
    res.json({
        places: userWithPlaces.places.map((place) =>
            place.toObject({ getters: true })
        ),
    })
}

const createPlace = async(req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        return next(
            new HttpError('Invalid inputs passed please check your data', 422)
        )
    }
    const { title, description, address, creator } = req.body

    let coordinates
    try {
        coordinates = await getCoordsForAddres(address)
    } catch (err) {
        return next(err)
    }
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator,
    })

    let user

    try {
        user = await User.findById(creator)
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500)
        return next(error)
    }

    if (!user) {
        const error = new HttpError('Could not find user for proviede id', 404)
        return next(error)
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdPlace.save({ session: sess })
        user.places.push(createdPlace)
        await user.save({ session: sess })
        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError('Creating place failed, please try agin', 500)
        return next(error)
    }

    res.status(201).json({ place: createdPlace })
}

const updatePlace = async(req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        const error = new HttpError(
            'Invalid inputs passed please check your data',
            422
        )
        return next(error)
    }
    const { title, description, address } = req.body
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError(
            'Somthing wnt wrong, could not update place',
            500
        )
        return next(error)
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place', 401)
        return next(error)
    }

    place.title = title
    place.description = description
    place.address = address

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place',
            500
        )
        return next(error)
    }

    res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async(req, res, next) => {
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (err) {
        const error = new HttpError(
            'Something went wrong could not delete place',
            500
        )
        return next(error)
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id', 404)
        return next(error)
    }

    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place', 401)
        return next(error)
    }

    const imagePath = place.image

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await place.deleteOne({ session: sess })
        place.creator.places.pull(place)
        await place.creator.save({ session: sess })
        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong could not delete place2',
            500
        )
        return next(error)
    }

    fs.unlink(imagePath, (err) => {
        console.log(err)
    })

    res.status(200).json({ message: 'Deleted place.' })
}

export default {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace,
}