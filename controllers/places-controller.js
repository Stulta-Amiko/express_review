import { v4 as uuid } from 'uuid'
import { validationResult } from 'express-validator'

import HttpError from '../models/http-error.js'
import getCoordsForAddres from '../util/loaction.js'

let DUMMY_PLACES = [{
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world',
        imageUrl: 'https://www.kkday.com/ko/blog/wp-content/uploads/%EB%89%B4%EC%9A%95-3%EB%8C%80-%EC%A0%84%EB%A7%9D%EB%8C%80-%EC%97%A0%ED%8C%8C%EC%9D%B4%EC%96%B4-%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%EB%B9%8C%EB%94%A9-%EC%99%B8%EA%B4%80.jpg',
        address: '20 W 34th St., New York, NY 10001, United States',
        location: {
            lat: 40.7484405,
            lng: -73.9878531,
        },
        creator: 'u1',
    },
    {
        id: 'p2',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world',
        imageUrl: 'https://i.namu.wiki/i/-VFr5YMPL3SvWiVggrL7_r8suboiaw8DZ49R7PvsVG1IysNFtYExYnBT2ZKVi4EWGUEj8lkf_LXSdbulSCTfT3fdIewfNYPVrFer3moyK0I8gj6lQTL1qvAts7paQEJHXZ_vbHWnJwcBXb5rsFdbeA.webp',
        address: '20 W 34th St., New York, NY 10001, United States',
        location: {
            lat: 40.7484405,
            lng: -73.9878531,
        },
        creator: 'u2',
    },
]

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find((p) => {
        return p.id === placeId
    })
    console.log('GET Request in Places')

    if (!place) {
        throw new HttpError('Could not find a place for the provided id', 404)
    }
    res.json({ place: place })
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter((p) => {
        return p.creator === userId
    })
    if (!places || places.length === 0) {
        throw next(new HttpError('Could not find a user for the provided id', 404))
    }
    res.json({ places })
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
    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator,
    }

    DUMMY_PLACES.push(createdPlace)

    res.status(201).json({ place: createdPlace })
}

const updatePlace = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        throw new HttpError('Invalid inputs passed please check your data', 422)
    }
    const { title, description } = req.body
    const placeId = req.params.pid

    const updatePlace = {...DUMMY_PLACES.find((p) => p.id === placeId) }
    const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId)
    updatePlace.title = title
    updatePlace.description = description

    DUMMY_PLACES[placeIndex] = updatePlace

    res.status(200).json({ place: updatePlace })
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid
    if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id', 404)
    }
    DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId)

    res.status(200).json({ message: 'Deleted place.' })
}

export default {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace,
}