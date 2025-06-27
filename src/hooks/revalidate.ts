// src/hooks/revalidate.ts

export const revalidateHomeAndList =
  (collection: string) =>
  async (args: any, context: any, ...rest: any[]) => {
    console.log('[HOOK] revalidateHomeAndList appelé', collection);
    // Sécurise l'accès à context et req
    const req = (context && context.req) ? context.req : args.req;
    if (!req || !req.payload) {
      return args.doc;
    }

    const { payload } = req;
    const frontendUrl = process.env.FRONTEND_URL;
    const secret = process.env.PAYLOAD_REVALIDATION_TOKEN;

    payload.logger.info(`[HOOK] Appel revalidateHomeAndList pour ${collection}`);

    if (!frontendUrl || !secret) {
      payload.logger.error('Variables FRONTEND_URL ou PAYLOAD_REVALIDATION_TOKEN manquantes.');
      return args.doc;
    }

    const paths = ['/', `/${collection}`];

    for (const path of paths) {
      const url = `${frontendUrl}/api/revalidate`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${secret}`,
          },
          body: JSON.stringify({ path }),
        });

        if (res.ok) {
          payload.logger.info(`Revalidation réussie pour le chemin : ${path}`);
        } else {
          const text = await res.text();
          payload.logger.error(`Erreur lors de la revalidation pour ${path}: ${text}`);
        }
      } catch (err: unknown) {
        payload.logger.error(`Erreur lors de l'appel à la route de revalidation pour ${path}: ${err}`);
      }
    }

    return args.doc;
  };