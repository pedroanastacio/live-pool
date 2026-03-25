const mockPoll = {
  title: 'Test',
  description: 'Test Description',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  options: [
    {
      description: 'Option 1',
      orderIndex: 0,
    },
    {
      description: 'Option 2',
      orderIndex: 1,
    },
  ],
};

export { mockPoll };
