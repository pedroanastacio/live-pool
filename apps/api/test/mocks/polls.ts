const mockPoll = {
  title: 'Test',
  description: 'Test Description',
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  options: [
    {
      description: 'Option 1',
      order_index: 0,
    },
    {
      description: 'Option 2',
      order_index: 1,
    },
  ],
};

export { mockPoll };
