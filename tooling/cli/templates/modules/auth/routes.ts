export const authRoutes = async (fastify: any) => {
    fastify.post('/login', async (request: any, reply: any) => {
        // Implement JWT signing here using @easycf/core-api or custom logic
        return { token: 'mock-jwt-token', user: { id: 1 } };
    });

    fastify.post('/register', async (request: any, reply: any) => {
        return { status: 'created' };
    });
};
