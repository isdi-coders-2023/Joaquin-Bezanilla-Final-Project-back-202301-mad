import { Repo } from '../repository/repo.interface.js';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { Food } from '../entities/food.js';
import { HTTPError } from '../error/error.js';

const debug = createDebug('latino-foods:food-controller');

export class FoodsController {
  constructor(public foodRepo: Repo<Food>) {
    this.foodRepo = foodRepo;
    debug('Food controller!');
  }

  async post(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('post-method');
      const newFood = req.body;
      debug('Food controller Post: ', newFood);
      const data = await this.foodRepo.create(newFood);
      resp.status(201);
      resp.json({
        results: [data],
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('getAll-controller method');
      const pageString = req.query.page || '1';
      const pageNumber = Number(pageString);
      if (pageNumber < 1 || pageNumber > 10)
        throw new HTTPError(400, 'Wrong page number', 'Page <1 or >10');
      const region = req.query.region || 'all';
      if (
        region !== 'chile' &&
        region !== 'argentina' &&
        region !== 'brazil' &&
        region !== 'mexico' &&
        region !== 'peru' &&
        region !== 'all'
      )
        throw new HTTPError(400, 'Wrong region', 'Non existing region');
      var filteredFood: Food[];
      debug(region);
      if (region === 'all') {
        filteredFood = await this.foodRepo.queryAll();
      } else {
        filteredFood = await this.foodRepo.search({
          key: 'region',
          value: region,
        });
      }
      const foodData = filteredFood.slice(
        (pageNumber - 1) * 12,
        pageNumber * 12
      );
      resp.status(201);
      resp.json({
        results: foodData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getId(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('getId-controller method');
      if (!req.params.id)
        throw new HTTPError(404, 'Not found', 'Not found food id in params');

      const foodData = await this.foodRepo.queryId(req.params.id);
      resp.status(201);
      resp.json({
        results: [foodData],
      });
    } catch (error) {
      next(error);
    }
  }
  async edit(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('Edit method - food controller');
      if (!req.params.id)
        throw new HTTPError(404, 'Not found', 'Food id not found in params');
      req.body.id = req.params.id;
      debug('Edit method - food controller : ', req.body.id);
      const foodData = await this.foodRepo.update(req.body);
      resp.status(201);
      resp.json({
        results: [foodData],
      });
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('Delete-method food controller');
      if (!req.params.id)
        throw new HTTPError(404, 'Not found', 'Food id not found in params');
      await this.foodRepo.delete(req.params.id);
      resp.status(201);
      resp.json({
        results: [],
      });
    } catch (error) {
      next(error);
    }
  }
}
