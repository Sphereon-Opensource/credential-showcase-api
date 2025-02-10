export type RepositoryDefinition<T, U> = {
    findById(id: string): Promise<T>;
    findAll(): Promise<T[]>;
    create(item: U): Promise<T>;
    update(id: string, item: T): Promise<T>;
    delete(id: string): Promise<void>;
};
