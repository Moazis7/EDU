class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async findById(id) {
    return await this.repository.findById(id);
  }

  async findOne(filter) {
    return await this.repository.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    return await this.repository.find(filter, options);
  }

  async updateById(id, data) {
    return await this.repository.updateById(id, data);
  }

  async deleteById(id) {
    return await this.repository.deleteById(id);
  }

  async count(filter = {}) {
    return await this.repository.count(filter);
  }
}

module.exports = BaseService; 