import { success } from '../../services/response/'
import request from 'request'
import { darkSkyKey } from '../../config'

export const index = ({ user, body: { lat, lng } }, res, next) => {
    requestForecast(lat, lng)
        .then(data => {
            res.status(200).json(JSON.parse(data));
        })
        .catch(err => {
            res.status(400).json(err)
        })
}

const requestForecast = (lat, lng) => new Promise((resolve, reject) => 
        request(`https://api.forecast.io/forecast/${darkSkyKey}/${lat},${lng}?exclude=daily,flags` , (err, response, body) => {
            if (err !== null) return reject(err)
            resolve(body);
        })
    )