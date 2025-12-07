import { parse } from 'node:url';
import { sendJson, notFound, methodNotAllowed } from './utils/response.js';
import { parseBody } from './middleware/bodyParser.js';
import { requireAuth } from './middleware/auth.js';
import { registerCommand, loginCommand, updateProfileCommand, uploadCvCommand } from './commands/AuthCommands.js';
import { getCurrentUserQuery } from './queries/AuthQueries.js';
import { listSchoolsQuery } from './queries/SchoolQueries.js';
import { requestVerificationCommand, decideVerificationCommand } from './commands/VerificationCommands.js';
import { listPendingVerificationsQuery, listApprovedVerificationsQuery, listMyVerificationsQuery } from './queries/VerificationQueries.js';
import { createOfferCommand, updateOfferCommand, deleteOfferCommand } from './commands/OfferCommands.js';
import { listOffersQuery, getOfferByIdQuery, listOffersByCompanyQuery } from './queries/OfferQueries.js';
import { createApplicationCommand, cancelApplicationCommand, decideApplicationCommand } from './commands/ApplicationCommands.js';
import { listMyApplicationsQuery, listApplicantsForOfferQuery } from './queries/ApplicationQueries.js';
import { env } from './config/env.js';

function match(pathname, pattern) {
  const names = [];
  const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => {
    names.push(m.slice(1));
    return '([^/]+)';
  }) + '$');
  const match = pathname.match(regex);
  if (!match) return null;
  const params = {};
  names.forEach((name, i) => params[name] = match[i + 1]);
  return params;
}

export async function router(req, res) {
  const { pathname, query } = parse(req.url, true);
  const context = { user: null };
  try {
    if (pathname === `${env.apiPrefix}/auth/register` && req.method === 'POST') {
      const body = await parseBody(req);
      const result = await registerCommand(body);
      return sendJson(res, 201, { data: result });
    }

    if (pathname === `${env.apiPrefix}/auth/login` && req.method === 'POST') {
      const body = await parseBody(req);
      const result = await loginCommand(body);
      return sendJson(res, 200, result);
    }

    if (pathname === `${env.apiPrefix}/auth/me`) {
      if (req.method === 'GET') {
        return requireAuth(async (req, res, ctx) => {
          const data = await getCurrentUserQuery(ctx);
          return sendJson(res, 200, { data });
        })(req, res, context);
      }
      if (req.method === 'PUT') {
        const body = await parseBody(req);
        return requireAuth(async (req, res, ctx) => {
          const data = await updateProfileCommand(ctx, body);
          return sendJson(res, 200, { data });
        })(req, res, context);
      }
      return methodNotAllowed(res);
    }

    if (pathname === `${env.apiPrefix}/auth/upload-cv` && req.method === 'POST') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await uploadCvCommand(ctx, body);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/schools` && req.method === 'GET') {
      const data = await listSchoolsQuery();
      return sendJson(res, 200, { items: data });
    }

    if (pathname === `${env.apiPrefix}/verifications` && req.method === 'POST') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await requestVerificationCommand(ctx, body);
        return sendJson(res, 201, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/verifications/me` && req.method === 'GET') {
      return requireAuth(async (req, res, ctx) => {
        const data = await listMyVerificationsQuery(ctx);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/verifications/school/pending` && req.method === 'GET') {
      return requireAuth(async (req, res, ctx) => {
        const data = await listPendingVerificationsQuery(ctx);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/verifications/school/approved` && req.method === 'GET') {
      return requireAuth(async (req, res, ctx) => {
        const data = await listApprovedVerificationsQuery(ctx);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    const decisionMatch = match(pathname, `${env.apiPrefix}/verifications/:id/decide`);
    if (decisionMatch && req.method === 'POST') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await decideVerificationCommand(ctx, Number(decisionMatch.id), body.status);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/offers` && req.method === 'GET') {
      const data = await listOffersQuery({ q: query.q, status: query.status });
      return sendJson(res, 200, { items: data });
    }

    const offerIdMatch = match(pathname, `${env.apiPrefix}/offers/:id`);
    if (offerIdMatch && req.method === 'GET') {
      const data = await getOfferByIdQuery(Number(offerIdMatch.id));
      if (!data) return notFound(res);
      return sendJson(res, 200, data);
    }

    if (pathname === `${env.apiPrefix}/offers/company` && req.method === 'GET') {
      return requireAuth(async (req, res, ctx) => {
        const items = await listOffersByCompanyQuery(ctx.user.userId);
        return sendJson(res, 200, { items });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/offers` && req.method === 'POST') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await createOfferCommand(ctx, body);
        return sendJson(res, 201, { data });
      })(req, res, context);
    }

    if (offerIdMatch && req.method === 'PUT') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await updateOfferCommand(ctx, Number(offerIdMatch.id), body);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    if (offerIdMatch && req.method === 'DELETE') {
      return requireAuth(async (req, res, ctx) => {
        const data = await deleteOfferCommand(ctx, Number(offerIdMatch.id));
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/applications` && req.method === 'POST') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await createApplicationCommand(ctx, body);
        return sendJson(res, 201, { data });
      })(req, res, context);
    }

    if (pathname === `${env.apiPrefix}/applications/me` && req.method === 'GET') {
      return requireAuth(async (req, res, ctx) => {
        const data = await listMyApplicationsQuery(ctx);
        return sendJson(res, 200, { items: data });
      })(req, res, context);
    }

    const appCancelMatch = match(pathname, `${env.apiPrefix}/applications/:id/cancel`);
    if (appCancelMatch && req.method === 'POST') {
      return requireAuth(async (req, res, ctx) => {
        const data = await cancelApplicationCommand(ctx, Number(appCancelMatch.id));
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    const appDecisionMatch = match(pathname, `${env.apiPrefix}/applications/:id/decision`);
    if (appDecisionMatch && req.method === 'PUT') {
      const body = await parseBody(req);
      return requireAuth(async (req, res, ctx) => {
        const data = await decideApplicationCommand(ctx, Number(appDecisionMatch.id), body.status);
        return sendJson(res, 200, { data });
      })(req, res, context);
    }

    const offerApplications = match(pathname, `${env.apiPrefix}/offers/:id/applications`);
    if (offerApplications && req.method === 'GET') {
      return requireAuth(async (req, res, ctx) => {
        const items = await listApplicantsForOfferQuery(ctx, Number(offerApplications.id));
        return sendJson(res, 200, { items });
      })(req, res, context);
    }

    return notFound(res);
  } catch (error) {
    console.error('Route error', error);
    return sendJson(res, 400, { message: error.message || 'Error inesperado' });
  }
}
