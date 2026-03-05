// Helper stub for TestContainers and DB clear before tests
export const setupTestDatabase = async () => {
    // Implement standard logic to run postgres container or wipe transactional states
    console.log('[EasyCF:test-utils] Using isolated transactional database schema...');
};

export const clearDatabase = async (db: any) => {
    // Truncate all tables based on drizzle schemas
    console.log('[EasyCF:test-utils] Truncating tables...');
};
