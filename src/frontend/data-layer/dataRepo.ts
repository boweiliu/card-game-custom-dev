// Interface for CRUD operations to the repository service

export interface DataRepo<T extends { id: string | number }> {
    create(item: T): Promise<void>;
    read(id: T['id']): Promise<T | undefined>;
    update(id: T['id'], item: T): Promise<void>;
    delete(id: T['id']): Promise<void>;
}

// Class implementing the DataRepo interface
export class DataRepoImpl<T extends { id: string | number }> implements DataRepo<T> {
    private storage: Map<T['id'], T> = new Map();

    async create(item: T): Promise<void> {
        this.storage.set(item.id, item);
    }

    async read(id: T['id']): Promise<T | undefined> {
        return this.storage.get(id);
    }

    async update(id: T['id'], item: T): Promise<void> {
        if (this.storage.has(id)) {
            this.storage.set(id, item);
        }
    }

    async delete(id: T['id']): Promise<void> {
        this.storage.delete(id);
    }
}
