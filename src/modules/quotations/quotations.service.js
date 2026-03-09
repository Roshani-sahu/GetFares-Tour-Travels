const { AppError } = require('../../core/errors');

const QUOTATION_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

function roundCurrency(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(2));
}

function toDateOnly(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function buildBookingNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BK-${stamp}-${randomPart}`;
}

function createQuotationsService({ repository, logger, events }) {
  function assertAuthenticatedUser(user) {
    if (!user?.id) {
      throw new AppError(401, 'Authentication required', 'AUTH_REQUIRED');
    }
  }

  function calculatePricing(payload) {
    const components = Array.isArray(payload.components) ? payload.components : [];
    if (!components.length) {
      throw new AppError(400, 'At least one component is required', 'QUOTATION_COMPONENT_REQUIRED');
    }

    const normalizedComponents = components.map((component) => ({
      itemType: component.itemType,
      description: component.description,
      cost: roundCurrency(component.cost),
    }));

    const totalCost = roundCurrency(
      normalizedComponents.reduce((sum, item) => sum + roundCurrency(item.cost), 0),
    );

    const marginPercent = Number(payload.marginPercent ?? 0);
    if (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > 100) {
      throw new AppError(400, 'marginPercent must be between 0 and 100', 'QUOTATION_INVALID_MARGIN_PERCENT');
    }

    const marginAmount = roundCurrency((totalCost * marginPercent) / 100);
    const discount = roundCurrency(payload.discount ?? 0);
    const tax = roundCurrency(payload.taxAmount ?? payload.tax ?? 0);

    if (discount < 0 || tax < 0) {
      throw new AppError(400, 'discount/tax cannot be negative', 'QUOTATION_INVALID_FINANCIAL_VALUES');
    }

    const finalPrice = roundCurrency(totalCost + marginAmount - discount + tax);
    if (finalPrice < 0) {
      throw new AppError(400, 'Final price cannot be negative', 'QUOTATION_INVALID_FINAL_PRICE');
    }

    return {
      components: normalizedComponents,
      totalCost,
      marginPercent: roundCurrency(marginPercent),
      discount,
      tax,
      finalPrice,
    };
  }

  async function getById(id, context = {}, options = {}) {
    logger.debug({ module: 'quotations', requestId: context.requestId, id }, 'Get quotation by id');
    const quotation = await repository.findById(id);

    if (!quotation) {
      throw new AppError(404, 'Quotation not found', 'QUOTATION_NOT_FOUND');
    }

    if (options.includeItems === false) {
      return quotation;
    }

    const items = await repository.findItemsByQuotationId(id);
    return { ...quotation, items };
  }

  async function create(payload, context = {}) {
    assertAuthenticatedUser(context.user);

    const lead = await repository.findLeadById(payload.leadId);
    if (!lead) {
      throw new AppError(404, 'Lead not found', 'LEAD_NOT_FOUND');
    }

    const pricing = calculatePricing(payload);
    const created = await repository.create({
      parent_quote_id: payload.parentQuoteId || null,
      lead_id: payload.leadId,
      created_by: context.user.id,
      pricing_id: payload.pricingId || null,
      total_cost: pricing.totalCost,
      margin_percent: pricing.marginPercent,
      discount: pricing.discount,
      tax: pricing.tax,
      final_price: pricing.finalPrice,
      version_number: 1,
      status: QUOTATION_STATUS.DRAFT,
      is_deleted: false,
    });

    const items = await repository.replaceItems(created.id, pricing.components);
    const quotation = { ...created, items };

    events.emitCreated(quotation);
    return quotation;
  }

  async function update(id, payload, context = {}) {
    assertAuthenticatedUser(context.user);

    const current = await getById(id, context, { includeItems: true });
    if (current.status !== QUOTATION_STATUS.DRAFT) {
      throw new AppError(409, 'Only DRAFT quotation can be edited', 'QUOTATION_LOCKED');
    }

    const pricing = calculatePricing({
      components: payload.components || current.items || [],
      marginPercent: payload.marginPercent ?? current.marginPercent,
      discount: payload.discount ?? current.discount,
      taxAmount: payload.taxAmount ?? payload.tax ?? current.tax,
    });

    const updated = await repository.update(id, {
      pricing_id: payload.pricingId !== undefined ? payload.pricingId : current.pricingId,
      total_cost: pricing.totalCost,
      margin_percent: pricing.marginPercent,
      discount: pricing.discount,
      tax: pricing.tax,
      final_price: pricing.finalPrice,
      version_number: Number(current.versionNumber || 1) + 1,
    });

    const items = payload.components
      ? await repository.replaceItems(id, pricing.components)
      : current.items;

    const quotation = { ...updated, items };
    events.emitUpdated(quotation);
    return quotation;
  }

  async function generatePdf(id, payload = {}, context = {}) {
    await getById(id, context, { includeItems: false });
    const pdfUrl = payload.pdfUrl || `https://crm.local/quotations/${id}.pdf`;
    return repository.update(id, { pdf_url: pdfUrl });
  }

  async function send(id, _payload = {}, context = {}) {
    assertAuthenticatedUser(context.user);
    const quotation = await getById(id, context, { includeItems: true });

    if (quotation.status === QUOTATION_STATUS.APPROVED || quotation.status === QUOTATION_STATUS.REJECTED) {
      throw new AppError(409, 'Finalized quotation cannot be sent', 'QUOTATION_FINALIZED');
    }

    const updated = await repository.update(id, {
      status: QUOTATION_STATUS.SENT,
      sent_at: new Date().toISOString(),
    });

    if (updated.leadId) {
      await repository.updateLeadStatus(updated.leadId, 'QUOTED');
    }

    events.emitSent({ id: updated.id, sentBy: context.user.id });
    return {
      ...updated,
      items: quotation.items,
    };
  }

  async function trackView(id, payload = {}, context = {}) {
    await getById(id, context, { includeItems: false });
    const view = await repository.createView({
      quotationId: id,
      ipAddress: payload.ipAddress || null,
    });

    events.emitViewed({ id, viewedAt: view.viewedAt });
    return view;
  }

  async function ensureBookingForApprovedQuote(quotation, payload, context) {
    const existing = await repository.findBookingByQuotationId(quotation.id);
    if (existing) {
      return existing;
    }

    const lead = quotation.leadId ? await repository.findLeadById(quotation.leadId) : null;

    const travelStartDate =
      toDateOnly(payload.travelStartDate) ||
      toDateOnly(lead?.travel_date || lead?.travelDate) ||
      new Date().toISOString().slice(0, 10);
    const travelEndDate = toDateOnly(payload.travelEndDate) || travelStartDate;

    if (travelEndDate < travelStartDate) {
      throw new AppError(400, 'travelEndDate cannot be before travelStartDate', 'QUOTATION_INVALID_TRAVEL_DATES');
    }

    return repository.createBooking({
      quotation_id: quotation.id,
      booking_number: buildBookingNumber(),
      travel_start_date: travelStartDate,
      travel_end_date: travelEndDate,
      total_amount: roundCurrency(quotation.finalPrice),
      cost_amount: roundCurrency(quotation.totalCost),
      advance_required: roundCurrency(quotation.finalPrice * 0.5),
      advance_received: 0,
      status: 'PENDING',
      payment_status: 'PENDING',
      created_by: context.user?.id || null,
    });
  }

  return Object.freeze({
    async list(filters = {}, context = {}) {
      logger.debug({ module: 'quotations', requestId: context.requestId, filters }, 'List quotations');
      const rows = await repository.findAll(filters);

      if (!filters.includeItems) {
        return rows;
      }

      const result = [];
      for (const row of rows) {
        const items = await repository.findItemsByQuotationId(row.id);
        result.push({ ...row, items });
      }
      return result;
    },

    getById,
    create,
    update,
    generatePdf,
    send,
    trackView,

    async approveMargin(id, _payload = {}, context = {}) {
      return getById(id, context, { includeItems: false });
    },

    async transitionStatus(id, payload, context = {}) {
      assertAuthenticatedUser(context.user);
      const quotation = await getById(id, context, { includeItems: true });

      if (![QUOTATION_STATUS.APPROVED, QUOTATION_STATUS.REJECTED].includes(payload.status)) {
        throw new AppError(400, 'Only APPROVED/REJECTED transitions are supported', 'QUOTATION_STATUS_UNSUPPORTED');
      }

      if (![QUOTATION_STATUS.DRAFT, QUOTATION_STATUS.SENT].includes(quotation.status)) {
        throw new AppError(409, 'Invalid status transition', 'QUOTATION_INVALID_STATUS_TRANSITION');
      }

      const updated = await repository.update(id, { status: payload.status });

      let booking = null;
      if (payload.status === QUOTATION_STATUS.APPROVED) {
        booking = await ensureBookingForApprovedQuote(updated, payload, context);
        if (updated.leadId) {
          await repository.updateLeadStatus(updated.leadId, 'CONVERTED');
        }
      }

      if (payload.status === QUOTATION_STATUS.REJECTED && updated.leadId) {
        await repository.updateLeadStatus(updated.leadId, 'LOST');
      }

      events.emitStatusChanged({ id: updated.id, status: updated.status });
      return {
        quotation: {
          ...updated,
          items: quotation.items,
        },
        booking,
      };
    },

    async listViews(id, filters = {}, context = {}) {
      await getById(id, context, { includeItems: false });
      return repository.findViewsByQuotationId(id, filters);
    },

    async listVersions(id, context = {}) {
      await getById(id, context, { includeItems: false });
      return [];
    },

    async listSendLogs(id, context = {}) {
      await getById(id, context, { includeItems: false });
      return [];
    },

    async runReminderAutomation() {
      return {
        processed: 0,
        triggered: 0,
        skipped: 0,
        reminders: [],
      };
    },

    async getLeadToQuoteReport(filters = {}, context = {}) {
      logger.debug({ module: 'quotations', requestId: context.requestId, filters }, 'Lead-to-quote report');
      return repository.getLeadToQuoteReport(filters);
    },

    async listTemplates() {
      return [];
    },

    async createTemplate() {
      throw new AppError(501, 'Template management is not available in current schema', 'QUOTATION_TEMPLATE_UNAVAILABLE');
    },

    async updateTemplate() {
      throw new AppError(501, 'Template management is not available in current schema', 'QUOTATION_TEMPLATE_UNAVAILABLE');
    },
  });
}

module.exports = {
  createQuotationsService,
  QUOTATION_STATUS,
};
