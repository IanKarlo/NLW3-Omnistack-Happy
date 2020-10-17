import { Request, Response} from 'express';
import { getRepository } from 'typeorm';
import Orphanage from '../models/Orphanage';
import * as Yup from 'yup';

import orphanagesView from '../views/orphanages_view';

export default {

  async index(req:Request, res:Response){

    const orphanageRepository = getRepository(Orphanage); 
    const orphanages = await orphanageRepository.find({
      relations: ['images']
    });
    return res.json(orphanagesView.renderMany(orphanages));

  },

  async show(req:Request, res:Response){

    const id = req.params.id;
    const orphanageRepository = getRepository(Orphanage); 
    const orphanage = await orphanageRepository.findOneOrFail(id,{
      relations: ['images']
    });
    return res.json(orphanagesView.render(orphanage));

  },

  async create(req:Request, res:Response){
    
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = req.body;

    const orphanageRepository = getRepository(Orphanage);

    const requestImgs = req.files as Express.Multer.File[];

    const images = requestImgs.map(image => {
      return { path: image.filename }
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends: open_on_weekends === 'true',
      images
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(Yup.object().shape({
        path: Yup.string().required()
      })) 
    });

    await schema.validate(data, {
      abortEarly: false
    })

    const orphanage = orphanageRepository.create(data);

    await orphanageRepository.save(orphanage);

    return res.status(201).json(orphanage);
  }
}