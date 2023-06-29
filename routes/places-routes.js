import express from 'express'
import HttpError from '../models/http-error.js'

const router = express.Router()

const DUMMY_PLACES = [{
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

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find((p) => {
        return p.id === placeId
    })
    console.log('GET Request in Places')

    if (!place) {
        throw new HttpError('Could not find a place for the provided id', 404)
    }
    res.json({ place: place })
})

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid
    const user = DUMMY_PLACES.find((p) => {
        return p.creator === userId
    })
    if (!user) {
        throw next(HttpError('Could not find a user for the provided id', 404))
    }
    res.json({ user: user })
})

export default router