import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateDeliveryValidatorRequest from 'App/Validators/Creche/CreateDeliveryValidatorRequest';
import CreateValidator from 'App/Validators/Creche/CreateValidator';
import Creche from 'App/Models/Creche';
export default class CrechesController {
    public async getAll({ response, }: HttpContextContract) {
        const creches = await Creche.all();
        if (creches == null) return response.noContent();
        return response.ok({ creches })
    }
    public async createOne({ request, response, }: HttpContextContract) {
        const payload = await request.validate(CreateValidator)

        const newCreche = await Creche.create(payload)

        return response.created(newCreche) // 201 CREATED
    }
    public async addNurseryCommand({ params, request, response, }: HttpContextContract) {
        const idCreche = params.idCreche;
        const payload = await request.validate(CreateDeliveryValidatorRequest);

        const creche = await Creche.find(idCreche);
        if (creche == null) {
            return response.notFound({ message: 'nursery not found' })
        }
        await creche?.merge(payload).save()
        return response.ok({ creche });
    }
    public async deleteOne({ response, params }: HttpContextContract) {
        const idCreche = params.id
        const creche = await Creche.find(idCreche)
        if (creche == null) return response.notFound();
        creche.delete()
        return response.ok({ message: "Creche deleted" });
    }


}
