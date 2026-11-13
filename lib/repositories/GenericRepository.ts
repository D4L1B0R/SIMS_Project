export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | null>;
  add(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: number): Promise<void>;
  findByExpression(expression: any): Promise<T[]>;
}

export abstract class GenericRepository<T> implements IRepository<T> {
  protected abstract prismaModel: any;

  async getAll(): Promise<T[]> {
    return await this.prismaModel.findMany();
  }

  async getById(id: number): Promise<T | null> {
    return await this.prismaModel.findUnique({
      where: { id }
    });
  }

  async findByExpression(expression: any): Promise<T[]> {
    return await this.prismaModel.findMany({
      where: expression
    });
  }

  async add(entity: T): Promise<void> {
    return await this.prismaModel.create({
      data: entity
    });
  }

  async update(entity: T): Promise<void> {
    return await this.prismaModel.update({
      where: { id: (entity as any).id },
      data: entity
    });
  }

  async delete(id: number): Promise<void> {
    await this.prismaModel.delete({
      where: { id }
    });
  }

  
}