import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateDeliveryValidatorRequest from 'App/Validators/Creche/CreateDeliveryValidatorRequest';
import CreateDeliveryValidatorParam from 'App/Validators/Creche/CreateDeliveryParamValidator';
import CreateValidator from 'App/Validators/Creche/CreateValidator';
import Tournee from 'App/Models/Tournee';
import Creche from 'App/Models/Creche';
export default class CrechesController {
    public async getAll({ response, }: HttpContextContract) {
        const creches = await Creche.all();
        if (creches == null) return response.noContent();
        return response.ok({ creches })
    }
    public async createOne({ request, response, }: HttpContextContract) {
        const payload = await request.validate(CreateValidator)

        const creche = await Creche.create(payload)

        return response.created(creche) // 201 CREATED
    }
    public async updateCommand({ params, request, response, }: HttpContextContract) {
        const idCreche = params.idCreche;
        const payload = await request.validate(CreateDeliveryValidatorRequest);

        const creche = await Creche.find(idCreche);
        if (creche == null) {
            return response.notFound({ message: 'nursery not found' })
        }
        await creche?.merge(payload).save()
        return response.ok({ creche });
    }
}
