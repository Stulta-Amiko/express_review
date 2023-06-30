import dotenv from 'dotenv'
import axios from 'axios'

import HttpError from '../models/http-error.js'

dotenv.config()
const API_KEY = process.env.API_KEY

const getCoordsForAddres = async(address) => {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
    )
    const data = response.data

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError(
            'Could not find loaction for the specified address',
            422
        )
        throw error
    }

    const coordinates = data.results[0].geometry.location

    return coordinates
}

export default getCoordsForAddres