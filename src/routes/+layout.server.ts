import type { PageServerLoad } from './$types'
import data from '../../static/data.json'

export const load: PageServerLoad = async () => {
    if (data) {
        return {
            ...data,
        }
    }

    return {
        status: 500,
    }
}