import { validationResult } from 'express-validator'

import Place from '../models/place.js'
import HttpError from '../models/http-error.js'
import getCoordsForAddres from '../util/loaction.js'

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
    let places

    try {
        places = await Place.find({ creator: userId })
    } catch (err) {
        const error = HttpError('Somthing went wrong, could not find a place', 500)
        return next(error)
    }

    if (!places || places.length === 0) {
        const error = new HttpError(
            'Could not find a user for the provided id',
            404
        )
        return next(error)
    }
    res.json({ places: places.map((place) => place.toObject({ getters: true })) })
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
        image: 'https://www.kkday.com/ko/blog/wp-content/uploads/%EB%89%B4%EC%9A%95-3%EB%8C%80-%EC%A0%84%EB%A7%9D%EB%8C%80-%EC%97%A0%ED%8C%8C%EC%9D%B4%EC%96%B4-%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%EB%B9%8C%EB%94%A9-%EC%99%B8%EA%B4%80.jpg',
        creator,
    })

    try {
        await createdPlace.save()
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
    const { title, description } = req.body
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

    place.title = title
    place.description = description

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
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError(
            'Something went wrong could not delete place',
            500
        )
        return next(error)
    }

    try {
        await place.deleteOne()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong could not delete place2',
            500
        )
        return next(error)
    }

    res.status(200).json({ message: 'Deleted place.' })
}

export default {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace,
}