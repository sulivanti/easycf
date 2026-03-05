export const iamRoutes = async (fastify: any) => {
    fastify.get('/roles', {
        preHandler: [fastify.requireAuth] // Requires the easycf/jwt plugin
    }, async (request: any, reply: any) => {
        return { roles: ['ADMIN', 'USER'] };
    });
};
