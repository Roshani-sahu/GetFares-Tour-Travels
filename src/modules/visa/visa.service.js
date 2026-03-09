const { AppError } = require('../../core/errors');

function createVisaService({ repository, logger, events }) {
  async function getById(id, context = {}) {
    logger.debug({ module: 'visa', requestId: context.requestId, id }, 'Getting record by id');
    const item = await repository.findById(id);

    if (!item) {
      throw new AppError(404, 'Visa not found', 'visa_NOT_FOUND');
    }

    return item;
  }

  return Object.freeze({
    list(filters = {}, context = {}) {
      logger.debug({ module: 'visa', requestId: context.requestId, filters }, 'Listing records');
      return repository.findAll(filters);
    },

    getById,

    async create(payload) {
      const created = await repository.create(payload);
      events.emitCreated(created);
      return created;
    },

    async update(id, payload, context = {}) {
      await getById(id, context);
      const updated = await repository.update(id, payload);
      events.emitUpdated(updated);
      return updated;
    },
  });
}

module.exports = { createVisaService };
