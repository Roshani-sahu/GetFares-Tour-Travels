function createQuotationsRepository({ db, logger, schema }) {
  function toNumber(value, fallback = null) {
    if (value === null || value === undefined) {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function toDate(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }

  function toQuotation(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      parentQuoteId: row.parent_quote_id ?? row.parentQuoteId ?? null,
      leadId: row.lead_id ?? row.leadId ?? null,
      createdBy: row.created_by ?? row.createdBy ?? null,
      pricingId: row.pricing_id ?? row.pricingId ?? null,
      totalCost: toNumber(row.total_cost ?? row.totalCost, 0),
      marginPercent: toNumber(row.margin_percent ?? row.marginPercent, 0),
      discount: toNumber(row.discount, 0),
      tax: toNumber(row.tax, 0),
      finalPrice: toNumber(row.final_price ?? row.finalPrice, 0),
      versionNumber: Number(row.version_number ?? row.versionNumber ?? 1),
      status: row.status,
      pdfUrl: row.pdf_url ?? row.pdfUrl ?? null,
      sentAt: toDate(row.sent_at ?? row.sentAt),
      isDeleted: Boolean(row.is_deleted ?? row.isDeleted ?? false),
      createdAt: toDate(row.created_at ?? row.createdAt),
    };
  }

  function toItem(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      quotationId: row.quotation_id ?? row.quotationId,
      itemType: row.item_type ?? row.itemType ?? null,
      description: row.description ?? null,
      cost: toNumber(row.cost, 0),
    };
  }

  function toView(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      quotationId: row.quotation_id ?? row.quotationId,
      viewedAt: toDate(row.viewed_at ?? row.viewedAt),
      ipAddress: row.ip_address ?? row.ipAddress ?? null,
    };
  }

  async function findItemsByQuotationId(quotationId) {
    const rows = await db.findMany(schema.itemsTable, { quotation_id: quotationId });
    return rows.map((row) => toItem(row));
  }

  return Object.freeze({
    async findAll(filters = {}) {
      const mappedFilters = {};

      if (filters.status) {
        mappedFilters.status = filters.status;
      }
      if (filters.leadId) {
        mappedFilters.lead_id = filters.leadId;
      }
      if (filters.createdBy) {
        mappedFilters.created_by = filters.createdBy;
      }
      if (filters.page) {
        mappedFilters.page = filters.page;
      }
      if (filters.limit) {
        mappedFilters.limit = filters.limit;
      }

      const rows = await db.findMany(schema.tableName, mappedFilters);
      const list = rows.map((row) => toQuotation(row));

      return list.sort((a, b) => {
        const left = new Date(a.createdAt || 0).getTime();
        const right = new Date(b.createdAt || 0).getTime();
        return right - left;
      });
    },

    async findById(id) {
      const row = await db.findById(schema.tableName, id);
      return toQuotation(row);
    },

    findItemsByQuotationId,

    async findViewsByQuotationId(quotationId, pagination = {}) {
      const filters = { quotation_id: quotationId };
      if (pagination.page) {
        filters.page = pagination.page;
      }
      if (pagination.limit) {
        filters.limit = pagination.limit;
      }

      const rows = await db.findMany(schema.viewsTable, filters);
      return rows
        .map((row) => toView(row))
        .sort((a, b) => {
          const left = new Date(a.viewedAt || 0).getTime();
          const right = new Date(b.viewedAt || 0).getTime();
          return right - left;
        });
    },

    async create(payload) {
      logger.debug({ module: 'quotations', payload }, 'Creating quotation');
      const row = await db.insert(schema.tableName, payload);
      return toQuotation(row);
    },

    async update(id, payload) {
      logger.debug({ module: 'quotations', id, payload }, 'Updating quotation');
      const row = await db.update(schema.tableName, id, payload);
      return toQuotation(row);
    },

    async replaceItems(quotationId, components = []) {
      await db.query('DELETE FROM quotation_items WHERE quotation_id = $1', [quotationId]);

      for (const item of components) {
        await db.insert(schema.itemsTable, {
          quotation_id: quotationId,
          item_type: item.itemType,
          description: item.description,
          cost: item.cost,
        });
      }

      return findItemsByQuotationId(quotationId);
    },

    async createView(payload) {
      const row = await db.insert(schema.viewsTable, {
        quotation_id: payload.quotationId,
        ip_address: payload.ipAddress || null,
      });
      return toView(row);
    },

    async findLeadById(id) {
      return db.findById(schema.leadsTable, id);
    },

    async updateLeadStatus(leadId, status) {
      return db.update(schema.leadsTable, leadId, { status });
    },

    async findBookingByQuotationId(quotationId) {
      return db.findOne(schema.bookingsTable, { quotation_id: quotationId });
    },

    async createBooking(payload) {
      return db.insert(schema.bookingsTable, payload);
    },

    async getLeadToQuoteReport(filters = {}) {
      const where = ['COALESCE(q.is_deleted, FALSE) = FALSE'];
      const params = [];

      if (filters.from) {
        params.push(filters.from);
        where.push(`q.created_at >= $${params.length}`);
      }

      if (filters.to) {
        params.push(filters.to);
        where.push(`q.created_at <= $${params.length}`);
      }

      if (filters.createdBy) {
        params.push(filters.createdBy);
        where.push(`q.created_by = $${params.length}`);
      }

      const whereSql = where.join(' AND ');

      const consultantSql = `
        SELECT
          q.created_by,
          u.full_name AS consultant_name,
          COUNT(*)::int AS total_quotes,
          SUM(CASE WHEN q.status = 'APPROVED' THEN 1 ELSE 0 END)::int AS approved_quotes,
          SUM(CASE WHEN q.status = 'REJECTED' THEN 1 ELSE 0 END)::int AS rejected_quotes,
          AVG(EXTRACT(EPOCH FROM (q.created_at - l.created_at)) / 60.0)::numeric(10,2) AS avg_lead_to_quote_minutes,
          AVG(q.final_price)::numeric(12,2) AS avg_quote_value,
          AVG(q.margin_percent)::numeric(8,2) AS avg_margin_percent
        FROM quotations q
        LEFT JOIN users u ON u.id = q.created_by
        LEFT JOIN leads l ON l.id = q.lead_id
        WHERE ${whereSql}
        GROUP BY q.created_by, u.full_name
        ORDER BY total_quotes DESC
      `;

      const overallSql = `
        SELECT
          COUNT(*)::int AS total_quotes,
          SUM(CASE WHEN q.status = 'APPROVED' THEN 1 ELSE 0 END)::int AS approved_quotes,
          SUM(CASE WHEN q.status = 'REJECTED' THEN 1 ELSE 0 END)::int AS rejected_quotes,
          AVG(EXTRACT(EPOCH FROM (q.created_at - l.created_at)) / 60.0)::numeric(10,2) AS avg_lead_to_quote_minutes,
          AVG(q.final_price)::numeric(12,2) AS avg_quote_value,
          AVG(q.margin_percent)::numeric(8,2) AS avg_margin_percent
        FROM quotations q
        LEFT JOIN leads l ON l.id = q.lead_id
        WHERE ${whereSql}
      `;

      const [consultantResult, overallResult] = await Promise.all([
        db.query(consultantSql, params),
        db.query(overallSql, params),
      ]);

      const byConsultant = consultantResult.rows.map((row) => {
        const total = Number(row.total_quotes || 0);
        const approved = Number(row.approved_quotes || 0);
        const rejected = Number(row.rejected_quotes || 0);
        const approvalRatePercent = total > 0 ? Number(((approved / total) * 100).toFixed(2)) : 0;

        return {
          createdBy: row.created_by,
          consultantName: row.consultant_name || null,
          totalQuotes: total,
          approvedQuotes: approved,
          rejectedQuotes: rejected,
          approvalRatePercent,
          avgLeadToQuoteMinutes: toNumber(row.avg_lead_to_quote_minutes, 0),
          avgQuoteValue: toNumber(row.avg_quote_value, 0),
          avgMarginPercent: toNumber(row.avg_margin_percent, 0),
        };
      });

      const overallRow = overallResult.rows[0] || {};
      const overallTotal = Number(overallRow.total_quotes || 0);
      const overallApproved = Number(overallRow.approved_quotes || 0);

      return {
        overall: {
          totalQuotes: overallTotal,
          approvedQuotes: overallApproved,
          rejectedQuotes: Number(overallRow.rejected_quotes || 0),
          approvalRatePercent: overallTotal > 0 ? Number(((overallApproved / overallTotal) * 100).toFixed(2)) : 0,
          avgLeadToQuoteMinutes: toNumber(overallRow.avg_lead_to_quote_minutes, 0),
          avgQuoteValue: toNumber(overallRow.avg_quote_value, 0),
          avgMarginPercent: toNumber(overallRow.avg_margin_percent, 0),
        },
        byConsultant,
      };
    },
  });
}

module.exports = { createQuotationsRepository };
