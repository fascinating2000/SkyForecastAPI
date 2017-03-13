import { Router } from 'express'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index } from './controller'
import { updateHistory } from '../user/controller'

const router = new Router()

/**
 * @api {post} /forecast Retrieve weather forecast depending on location
 * @apiName RetrieveForecast
 * @apiGroup Forecast
 * @apiPermission User
 * @apiParam {Object} place Place where to get weather forecast
 * @apiSuccess {Object[]} forecast list of places.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.post('/',
    token({ required: true }),
    body({
        place: {
            required: true,
            type: String
        },
        lat: {            
            type: Number,
            required: true
        },
        lng:{
            type: Number,
            required: true
        }
    }),
    updateHistory(true),
    index)

export default router