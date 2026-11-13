import { IRepository } from '../repositories/GenericRepository';

export abstract class GenericController<T, TDTO> {
  protected readonly repository: IRepository<T>;

  constructor(repository: IRepository<T>) {
    this.repository = repository;
  }

  abstract translateDTO(dto: TDTO): T;
  abstract translateModel(model: T): TDTO;
  abstract verifyDTO(dto: TDTO): boolean;

  async getById(id: number): Promise<TDTO | null> {
    const model = await this.repository.getById(id);
    if (!model) {
      return null;
    }
    return this.translateModel(model);
  }

  async getAll(): Promise<TDTO[]> {
    const models = await this.repository.getAll();
    return models.map(model => this.translateModel(model));
  }

}